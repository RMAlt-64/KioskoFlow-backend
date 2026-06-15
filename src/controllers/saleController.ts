import type { Request, Response } from 'express';
import sequelize from '../config/database.js';
import Sale from '../models/Sale.js';
import SaleDetail from '../models/SaleDetail.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js'; // <-- IMPORTANTE: Importar Customer
import CustomerAccount from '../models/CustomerAccount.js'; // <-- IMPORTANTE: Importar CustomerAccount


export const createSale = async (req: Request, res: Response) => {
  // Iniciamos una transacción de Sequelize
  const transaction = await sequelize.transaction();

  try {
    // El cliente nos manda: quién atiende (user_id), quién compra (customer_id) y la lista de productos
    const { user_id, customer_id, products, payment_method } = req.body;

    // 1. Validaciones básicas
    if (!user_id || !customer_id || !products || products.length === 0 || !payment_method) {
      return res.status(400).json({ message: 'Datos de la venta incompletos.' });
    }
    console.log('Datos recibidos para la venta:', { user_id, customer_id, products, payment_method });

    // 2. Si quiere fiar, primero investigamos al cliente
    if (payment_method === 'Cuenta corriente') {
      const customer = await Customer.findByPk(customer_id, { transaction });
      
      if (!customer) {
        await transaction.rollback();
        return res.status(404).json({ message: 'El cliente especificado no existe.' });
      }

      // ¡REGLA DE ORO!: Si no tiene el permiso activado, le rebotamos la operación en el acto
      if (!customer.allow_credit) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `El cliente '${customer.name}' no está autorizado para comprar fiado (Cuenta Corriente deshabilitada).` 
        });
      }
    }

    // Creamos la cabecera de la venta (empieza en total 0, lo calculamos abajo)
    const newSale = await Sale.create({
        total: 0,
        customer_id, // <-- ¡Acá impacta el 1 (random) o el ID del cliente de confianza!
        user_id,
        paymentMethod: payment_method
    }, { transaction });

    let totalVenta = 0;

    // 3. El bucle de productos que ya armaste y funciona excelente
    for (const item of products) {
      const { product_id, quantity } = item;

      // Buscamos el producto para saber su precio actual y su stock
      const product = await Product.findByPk(product_id, { transaction });
      
      if (!product) {
        await transaction.rollback(); // Cancelamos todo si el producto no existe
        return res.status(404).json({ message: `El producto con ID ${product_id} no existe.` });
      }

      // Control de Stock: Verificamos si nos queda suficiente mercadería en el kiosco
      if (product.stock < quantity) {
        await transaction.rollback(); // Cancelamos toda la venta para que no quede inconsistente
        return res.status(400).json({ message: `Stock insuficiente para: ${product.name}. Stock actual: ${product.stock}` });
      }

      // Calculamos el subtotal de este renglón
      const subtotalItem = Number(product.price) * quantity;
      totalVenta += subtotalItem;

      // Guardamos el detalle del renglón con el precio histórico de este momento
      await SaleDetail.create({
        sale_id: newSale.id,
        product_id,
        quantity,
        unit_price: product.price
      }, { transaction });

      // RESTAMOS EL STOCK: Modificamos el producto original y lo guardamos
      product.stock -= quantity;
      await product.save({ transaction });
    }

    // 3. Finalmente, actualizamos el total real de la cabecera de la venta
    newSale.total = totalVenta;
    await newSale.save({ transaction });

    // 4. NUEVO: Si la venta fue fiada, registramos el movimiento de DEUDA
    if (payment_method === 'Cuenta corriente') {
      await CustomerAccount.create({
        customer_id,
        sale_id: newSale.id,
        type: 'debit', // debit significa que nos debe plata
        amount: totalVenta,
        description: `Compra fiada - Venta #${newSale.id}`
      }, { transaction });
    }

    // Si todo salió bien hasta acá, confirmamos los cambios físicamente en PostgreSQL
    await transaction.commit();

    return res.status(201).json({
      message: 'Venta realizada con éxito 🎉',
      sale_id: newSale.id,
      total: totalVenta
    });

  } catch (error) {
    // Si saltó cualquier error inesperado, deshacemos todo para proteger los datos
    await transaction.rollback();
    console.error(error);
    return res.status(500).json({ message: 'Error crítico al procesar la venta.' });
  }
};

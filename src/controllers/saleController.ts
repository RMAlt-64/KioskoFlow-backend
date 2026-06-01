import type { Request, Response } from 'express';
import sequelize from '../config/database.js';
import Sale from '../models/Sale.js';
import SaleDetail from '../models/SaleDetail.js';
import Product from '../models/Product.js';

export const createSale = async (req: Request, res: Response) => {
  // Iniciamos una transacción de Sequelize
  const transaction = await sequelize.transaction();

  try {
    // El cliente nos manda: quién atiende (user_id), quién compra (customer_id) y la lista de productos
    const { user_id, customer_id, products } = req.body;

    // 1. Validaciones básicas
    if (!user_id || !customer_id || !products || products.length === 0) {
      return res.status(400).json({ message: 'Datos de la venta incompletos.' });
    }

    // Creamos la cabecera de la venta (empieza en total 0, lo calculamos abajo)
    const newSale = await Sale.create({
        total: 0,
        customer_id, // <-- ¡Acá impacta el 1 (random) o el ID del cliente de confianza!
        user_id,
        paymentMethod: 'Efectivo'
    }, { transaction });

    let totalVenta = 0;

    // 2. Recorremos el carrito de compras que viene del frontend
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

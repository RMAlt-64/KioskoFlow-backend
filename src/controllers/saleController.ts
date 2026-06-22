import type { Request, Response } from 'express';
import type { Transaction } from 'sequelize';
import sequelize from '../config/database.js';
import Sale from '../models/Sale.js';
import SaleDetail from '../models/SaleDetail.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import CustomerAccount from '../models/CustomerAccount.js';
import User from '../models/User.js';

// ==========================================
// 🛠️ FUNCIONES AUXILIARES (MODULARIZACIÓN)
// ==========================================

/**
 * Valida si el cliente existe, si puede fiar y si no supera su límite de crédito proyectado.
 */
const validarCuentaCorrienteYLimite = async (
  customer_id: number,
  totalVentaNueva: number,
  transaction: Transaction
): Promise<void> => {
  const customer = await Customer.findByPk(customer_id, { transaction });

  if (!customer) {
    throw new Error('El cliente especificado no existe.');
  }

  // REGLA DE ORO 1: ¿Tiene el permiso activado?
  if (!customer.allow_credit) {
    throw new Error(`El cliente '${customer.name}' no está autorizado para comprar fiado (Cuenta Corriente deshabilitada).`);
  }

  // REGLA DE ORO 2: Control de Límite de Crédito Máximo
  const totalDebit = await CustomerAccount.sum('amount', {
    where: { customer_id, type: 'debit' },
    transaction
  }) || 0;

  const totalCredit = await CustomerAccount.sum('amount', {
    where: { customer_id, type: 'credit' },
    transaction
  }) || 0;

  const saldoActual = Number(totalDebit) - Number(totalCredit);
  const deudaProyectada = saldoActual + totalVentaNueva;
  const limiteAutorizado = Number((customer as any).max_credit || 20000.00); // Respaldo por defecto por las dudas

  if (deudaProyectada > limiteAutorizado) {
    throw new Error(`Operación rechazada por límite de crédito 🚫. El cliente '${customer.name}' tiene un saldo deudor de $${saldoActual}. Intentó comprar por $${totalVentaNueva}, lo que llevaría su deuda a $${deudaProyectada}, superando su límite máximo permitido de $${limiteAutorizado}.`);
  }
};

/**
 * Calcula el total previo de los productos enviados en la request para validaciones.
 */
const calcularTotalProyectado = async (products: any[], transaction: Transaction): Promise<number> => {
  let total = 0;
  for (const item of products) {
    const product = await Product.findByPk(item.product_id, { transaction });
    if (!product) {
      throw new Error(`El producto con ID ${item.product_id} no existe.`);
    }
    total += Number(product.price) * item.quantity;
  }
  return total;
};

/**
 * Procesa cada ítem del carrito: valida stock, resta inventario y genera los detalles históricos.
 */
const procesarStockYDetalles = async (
  sale_id: number,
  products: any[],
  transaction: Transaction
): Promise<void> => {
  for (const item of products) {
    const { product_id, quantity } = item;

    const product = await Product.findByPk(product_id, { transaction });

    if (!product) {
      throw new Error(`El producto con ID ${product_id} no existe.`);
    }

    // Control de Stock
    if (product.stock < quantity) {
      throw new Error(`Stock insuficiente para: ${product.name}. Stock actual: ${product.stock}`);
    }

    // Guardamos el detalle del renglón con el precio histórico
    await SaleDetail.create({
      sale_id,
      product_id,
      quantity,
      unit_price: product.price
    }, { transaction });

    // Restamos el stock físico del producto
    product.stock -= quantity;
    await product.save({ transaction });
  }
};

// ==========================================
// 🚀 ENDPOINTS PRINCIPALES
// ==========================================

export const createSale = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { user_id, customer_id, products, payment_method } = req.body;

    // 1. Validaciones básicas de entrada
    if (!user_id || !customer_id || !products || products.length === 0 || !payment_method) {
      return res.status(400).json({ message: 'Datos de la venta incompletos.' });
    }

    // 2. Pre-cálculo del total de la venta para validar reglas de negocio
    const totalVenta = await calcularTotalProyectado(products, transaction);

    // 3. Si quiere fiar, ejecutamos el escudo modularizado de cuenta corriente y límites
    if (payment_method === 'Cuenta corriente') {
      await validarCuentaCorrienteYLimite(customer_id, totalVenta, transaction);
    }

    // 4. Creamos la cabecera de la venta con su total real directo
    const newSale = await Sale.create({
      total: totalVenta,
      customer_id,
      user_id,
      paymentMethod: payment_method
    }, { transaction });

    // 5. Procesamos stock y creamos los detalles de los renglones
    await procesarStockYDetalles(newSale.id, products, transaction);

    // 6. Si la venta fue fiada, registramos el movimiento de DEUDA en su cuenta
    if (payment_method === 'Cuenta corriente') {
      await CustomerAccount.create({
        customer_id,
        sale_id: newSale.id,
        type: 'debit',
        amount: totalVenta,
        description: `Compra fiada - Venta #${newSale.id}`
      }, { transaction });
    }

    // Guardamos físicamente los cambios
    await transaction.commit();

    return res.status(201).json({
      message: 'Venta realizada con éxito 🎉',
      sale_id: newSale.id,
      total: totalVenta
    });

  } catch (error: any) {
    // Si saltó cualquier error o regla de negocio fallada, cancelamos la transacción completa
    await transaction.rollback();
    console.error('Error en transaccion de venta:', error.message);
    return res.status(400).json({ message: error.message || 'Error crítico al procesar la venta.' });
  }
};

export const getSalesHistory = async (req: Request, res: Response) => {
  try {
    const sales = await Sale.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        },
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name']
        },
        {
          model: SaleDetail,
          as: 'details',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'price']
            }
          ]
        }
      ]
    });

    const historialCastellano = sales.map(sale => {
      const saleJson = sale.toJSON() as any;

      return {
        venta_id: saleJson.id,
        fecha: saleJson.createdAt,
        total: Number(saleJson.total),
        metodo_pago: saleJson.paymentMethod,
        vendedor: saleJson.user ? saleJson.user.username : 'Desconocido',
        cliente: saleJson.customer ? saleJson.customer.name : 'Consumidor Final',
        productos_vendidos: saleJson.details.map((detail: any) => ({
          producto_id: detail.product_id,
          nombre_producto: detail.product ? detail.product.name : 'Producto Eliminado',
          cantidad: detail.quantity,
          precio_unitario_historico: Number(detail.unit_price),
          subtotal: Number(detail.unit_price) * detail.quantity
        }))
      };
    });

    return res.status(200).json(historialCastellano);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener el historial de ventas.' });
  }
};
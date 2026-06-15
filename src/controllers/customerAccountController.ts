import type { Request, Response } from 'express';
import Customer from '../models/Customer.js';
import CustomerAccount from '../models/CustomerAccount.js';

export const registerPayment = async (req: Request, res: Response) => {
  try {
    const { customer_id, amount, description } = req.body;

    // 1. Validaciones básicas
    if (!customer_id || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Datos del pago inválidos o incompletos.' });
    }

    // 2. Verificar que el cliente exista y que maneje cuenta corriente
    const customer = await Customer.findByPk(customer_id);
    if (!customer) {
      return res.status(404).json({ message: 'El cliente especificado no existe.' });
    }

    if (!customer.allow_credit) {
      return res.status(400).json({ 
        message: `El cliente '${customer.name}' no tiene habilitada la cuenta corriente para registrar pagos.` 
      });
    }

    // 3. Crear el movimiento de CRÉDITO (entrega de dinero)
    const newPayment = await CustomerAccount.create({
      customer_id,
      sale_id: null, // Es null porque no es una venta, es una entrega de plata pura
      type: 'credit', // 'credit' resta deuda en la cuenta corriente
      amount,
      description: description || 'Entrega de efectivo / Pago parcial'
    });

    return res.status(201).json({
      message: `Pago registrado con éxito para el cliente ${customer.name} 🎉`,
      movement: newPayment
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error crítico al registrar el pago.' });
  }
};
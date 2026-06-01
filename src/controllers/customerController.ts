import type { Request, Response } from 'express';

import Customer from '../models/Customer.js';

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, lastName, phone, DNI, creditMax  } = req.body;

    // Validamos que el Documento de la persona debe ser único
    const existingCustomer = await Customer.findOne({ where: { name } });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Cliente ya existe' });
    }

    // Creamos el nuevo cliente
    const newCustomer = await Customer.create({ name, lastName, phone, DNI, creditMax });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error al crear cliente.' });
  }
};


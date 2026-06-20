import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import Customer from '../models/Customer.js';

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, lastName, phone, DNI, creditMax, allow_credit } = req.body;

    // Validamos que el Documento de la persona debe ser único
    const existingCustomer = await Customer.findOne({ where: { name } });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Cliente ya existe' });
    }

    // Creamos el nuevo cliente
    const newCustomer = await Customer.create({ name, lastName, phone, DNI, creditMax, allow_credit }); // Si el crédito máximo es mayor a 0, le damos permiso para comprar fiado

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error al crear cliente.' });
  }
};

export const searchCustomers = async (req: Request, res: Response) => {
  try {
    // Capturamos el término de búsqueda de la URL. Ej: /api/customers/search?term=juan
    const { term } = req.query;

    // Si no mandan ningún término, devolvemos un array vacío en vez de romper el servidor
    if (!term || typeof term !== 'string') {
      return res.status(200).json([]);
    }

    // Buscamos en la base de datos
    const customers = await Customer.findAll({
      where: {
        // Op.or permite que se cumpla una condición O la otra
        [Op.or]: [
          {
            // Busca si el nombre contiene el término parcial (iLike = insensible a mayúsculas)
            name: {
              [Op.iLike]: `%${term}%` // El '%' a los lados significa "cualquier texto antes o después"
            }
          },
          {
            // Busca si el DNI contiene el término parcial
            DNI: {
              [Op.iLike]: `%${term}%`
            }
          }
        ]
      },
      limit: 10 // Limitamos a 10 resultados para que sea súper rápido y no sature la pantalla
    });

    // Mapeamos la respuesta para que el Frontend la reciba bien clarita en castellano
    const resultadoCastellano = customers.map(customer => ({
      customer_id: customer.id,
      nombre: customer.name,
      dni: customer.DNI || 'Sin especificar',
      permite_credito: customer.allow_credit
    }));

    return res.status(200).json(resultadoCastellano);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error crítico al buscar clientes.' });
  }
};
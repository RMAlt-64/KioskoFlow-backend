import type { Request, Response } from 'express';

import User from '../models/User.js';

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, role } = req.body;

    // Validamos que el rol sea válido
    if (!['Administrador', 'Empleado'].includes(role)) {
      return res.status(400).json({ message: 'Rol no válido. Debe ser "Administrador" o "Empleado".' });
    }

    // Creamos el nuevo usuario
    const newUser = await User.create({ username, role });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear usuario.' });
  }
};

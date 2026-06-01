import type { Request, Response } from 'express';
import Provider from '../models/Provider.js';

// 1. CREAR UN PROVEEDOR
export const createProvider = async (req: Request, res: Response) => {
  try {
    const { name, phone, direction } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre del proveedor es obligatorio.' });
    }

    const newProvider = await Provider.create({ name, phone, direction });
    return res.status(201).json(newProvider);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe un proveedor con ese nombre.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Error al crear el proveedor.' });
  }
};

// 2. OBTENER TODOS LOS PROVEEDORES
export const getAllProviders = async (req: Request, res: Response) => {
  try {
    const providers = await Provider.findAll({ order: [['name', 'ASC']] });
    return res.status(200).json(providers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener los proveedores.' });
  }
};

// 3. ACTUALIZAR UN PROVEEDOR
export const updateProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, phone } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'El nombre del proveedor es obligatorio.' });
    }

    const provider = await Provider.findByPk(id);
    if (!provider) {
      return res.status(404).json({ message: 'Proveedor no encontrado.' });
    }

    provider.name = name;
    provider.phone = phone || provider.phone; // Si no pasan teléfono, mantenemos el actual
    await provider.save();

    return res.status(200).json(provider);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe un proveedor con ese nombre.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar el proveedor.' });
  }
};

// 4. ELIMINAR UN PROVEEDOR
export const deleteProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const provider = await Provider.findByPk(id);
    if (!provider) {
      return res.status(404).json({ message: 'Proveedor no encontrado.' });
    }

    await provider.destroy();
    return res.status(200).json({ message: 'Proveedor eliminado exitosamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar el proveedor.' });
  }
};
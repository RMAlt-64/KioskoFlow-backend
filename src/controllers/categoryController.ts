import type { Request, Response } from 'express';
import Category from '../models/Category.js';


export const createCategory = async (req: Request, res: Response) => {
  try {
    // 1. Extraemos el nombre del cuerpo de la petición (body)
    const { name } = req.body;
    console.log('Petición recibida en el controlador:', req.body);

    // 2. Validación simple (Toque profesional)
    if (!name) {
       return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
    }

    // 3. Usamos el modelo para guardar en la base de datos
    const newCategory = await Category.create({ name });

    // 4. Respondemos con éxito y el objeto creado
    return res.status(201).json(newCategory);

  } catch (error: any) {
    // 5. Manejo de errores (ej: nombre duplicado)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }
    
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// 1. OBTENER TODAS LAS CATEGORÍAS (Leer)
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    // .findAll() busca todos los registros de la tabla
    const categories = await Category.findAll({
      order: [['name', 'ASC']] // Las ordenamos alfabéticamente de la A a la Z
    });
    
    return res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener las categorías' });
  }
};

// 2. ACTUALIZAR UNA CATEGORÍA (Editar)
export const updateCategory = async (req: Request, res: Response) => {
  try {
   
    const { name } = req.body; // Sacamos el nuevo nombre del body
    const { id } = req.params as { id: string}; // Convertimos el ID a string

    // Buscamos si la categoría existe
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Actualizamos el nombre en la base de datos
    category.name = name;
    await category.save();

    return res.status(200).json({ message: 'Categoría actualizada con éxito', category });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

// 3. ELIMINAR UNA CATEGORÍA (Borrar)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string}; // Convertimos el ID a string

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Borramos el registro de la base de datos
    await category.destroy();

    return res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
};
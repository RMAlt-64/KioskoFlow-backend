import type { Request, Response } from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js'; // Lo importamos para poder incluirlo en la consulta
import Provider from '../models/Provider.js'; // Lo importamos para poder incluirlo en la consulta

// 1. CREAR UN PRODUCTO
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock, category_id, provider_id } = req.body;

    // Validación básica
    if (!name || !price || !category_id || !provider_id) {
      return res.status(400).json({ message: 'Nombre, precio, categoría y proveedores son obligatorios.' });
    }

    // Creamos el producto en la base de datos
    const newProduct = await Product.create({
      name,
      price,
      stock: stock || 0, // Si no pasan stock, por defecto es 0
      category_id,
      provider_id
    });

    return res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al crear el producto.' });
  }
};

// 2. OBTENER TODOS LOS PRODUCTOS (Con su Categoría incluida)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll({
      // Aquí ocurre la magia de la asociación gracia a associations.ts
      include: [
        {
          model: Category,
          as: 'category', // El alias que definimos en associations.ts
          attributes: ['id', 'name'] // Solo queremos traer el id y el nombre de la categoría, no todo
        },
        {
          model: Provider,
          as: 'provider', // El alias que definimos en associations.ts
          attributes: ['id', 'name', 'phone'] // Traemos los datos útiles del proveedor
        }
      ],
      order: [['name', 'ASC']]
    });

    return res.status(200).json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener los productos.' });
  }
};

// --- (Mantené arriba tus funciones createProduct y getAllProducts) ---

// 3. ACTUALIZAR UN PRODUCTO (Editar)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string }; // Tipamos el id rápido como string
    const { name, price, stock, category_id } = req.body;

    // Buscamos si el producto existe
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    // Opcional: Podríamos validar si el category_id nuevo realmente existe, 
    // pero PostgreSQL nos tirará error automáticamente si no existe gracias a la FK.

    // Actualizamos los campos
    product.name = name || product.name;
    product.price = price || product.price;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category_id = category_id || product.category_id;

    await product.save();

    return res.status(200).json({ message: 'Producto actualizado con éxito.', product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar el producto.' });
  }
};

// 4. ELIMINAR UN PRODUCTO (Borrar)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    // Borramos el producto de la base de datos
    await product.destroy();

    return res.status(200).json({ message: 'Producto eliminado correctamente.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al eliminar el producto.' });
  }
};
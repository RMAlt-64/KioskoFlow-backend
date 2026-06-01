import  Router from 'express';
import  {
    createCategory,
    getAllCategories, 
    updateCategory, 
    deleteCategory
}  from '../controllers/categoryController.js';  

const router = Router();

// Definimos que cuando llegue un POST a la raíz de este router, use el controlador

router.post('/', createCategory);

// Obtener todas las categorías
router.get('/', getAllCategories);

// Actualizar una categoría (usa :id como parámetro variable)
router.put('/:id', updateCategory);

// Eliminar una categoría
router.delete('/:id', deleteCategory);

export default router;
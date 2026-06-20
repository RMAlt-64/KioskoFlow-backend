import  Router from 'express';

import  {
    createCustomer,
    searchCustomers
}  from '../controllers/customerController.js';

const router = Router();

router.get('/search', searchCustomers);

// Definimos que cuando llegue un POST a la raíz de este router, use el controlador
router.post('/', createCustomer);

export default router;

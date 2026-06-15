import { Router } from 'express';
import { registerPayment } from '../controllers/customerAccountController.js';
import { getCustomerBalance } from '../controllers/customerAccountController.js';

const router = Router();

// Ruta para que los clientes vengan a pagar lo que deben
router.post('/payment', registerPayment);
router.get('/balance/:customer_id', getCustomerBalance);

export default router;
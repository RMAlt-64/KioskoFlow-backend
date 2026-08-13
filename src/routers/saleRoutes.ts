import { Router } from 'express';
import { 
    createSale,
    getSalesHistory,
    anularSale
} from '../controllers/saleController.js';

const router = Router();

router.post('/', createSale);
router.get('/history', getSalesHistory);
router.patch('/:id/anular', anularSale);


export default router;

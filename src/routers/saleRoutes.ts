import { Router } from 'express';
import { 
    createSale,
    getSalesHistory,
    anularSale, 
    getStats
} from '../controllers/saleController.js';

const router = Router();

router.post('/', createSale);
router.get('/stats', getStats);
router.get('/history', getSalesHistory);
router.patch('/:id/anular', anularSale);


export default router;

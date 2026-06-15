import { Router } from 'express';
import { 
    createSale,
    getSalesHistory
} from '../controllers/saleController.js';

const router = Router();

router.post('/', createSale);
router.get('/history', getSalesHistory);


export default router;

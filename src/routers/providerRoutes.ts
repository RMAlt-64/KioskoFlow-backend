import { Router } from 'express';
import { 
    createProvider,
    getAllProviders,
    updateProvider,
    deleteProvider

} from '../controllers/providerController.js';

const router = Router();

router.post('/', createProvider);
router.get('/', getAllProviders);
router.put('/:id', updateProvider);
router.delete('/:id', deleteProvider);

export default router;
import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { 
  getServices, 
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';

const router = express.Router();

router.get('/:profissionalId', getServices); 
router.post('/', authenticateToken, createService); 
router.put('/:id', authenticateToken, updateService);
router.delete('/:id', authenticateToken, deleteService); 

export default router;
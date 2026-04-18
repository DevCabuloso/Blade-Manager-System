import express from 'express';
import { authenticateTokenRelaxed } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/authorize.js';
import {
  getServices,
  getOwnServices,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';

const router = express.Router();

router.get('/me', authenticateTokenRelaxed, requireRole('barbeiro', 'admin'), getOwnServices);
router.get('/:profissionalId', getServices);
router.post('/', authenticateTokenRelaxed, requireRole('barbeiro', 'admin'), createService);
router.put('/:id', authenticateTokenRelaxed, requireRole('barbeiro', 'admin'), updateService);
router.delete('/:id', authenticateTokenRelaxed, requireRole('barbeiro', 'admin'), deleteService);

export default router;

import express from 'express';
import { getProfessionalReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/authorize.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole('admin'), getProfessionalReport);

export default router;

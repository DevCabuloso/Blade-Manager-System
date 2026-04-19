import express from 'express';
import { authenticateToken, authenticateTokenRelaxed } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/authorize.js';
import { getAppointments, createAppointment, getAppointmentsByDate } from '../controllers/appointmentController.js';

const router = express.Router();

router.get('/me', authenticateToken, getAppointments);
router.get('/:barbeiroId/:data', getAppointmentsByDate);
router.post('/', authenticateTokenRelaxed, createAppointment);

export default router;

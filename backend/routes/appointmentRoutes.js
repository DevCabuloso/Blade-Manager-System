import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { getAppointments, createAppointment, getAppointmentsByDate } from '../controllers/appointmentController.js';

const router = express.Router();


router.get('/me', authenticateToken, getAppointments);



router.get('/:barbeiroId/:data', getAppointmentsByDate);


router.post('/', authenticateToken, createAppointment);

export default router;
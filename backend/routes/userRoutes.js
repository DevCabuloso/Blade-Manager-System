import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
  getUser,
  updateMe,
  updateUser,
  deleteMe,
  deleteUser,
  getAllProfessionals,
  suspendUser,
  enableUser
} from '../controllers/userController.js';
import { authenticateToken, authenticateTokenRelaxed } from '../middlewares/authMiddleware.js';
import { requireRole, requireSelfOrAdmin } from '../middlewares/authorize.js';
import { createRateLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();
const authLoginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
});
const authRegisterLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
  message: 'Muitas tentativas de cadastro. Tente novamente em alguns minutos.',
});

router.post('/', authRegisterLimiter, registerUser);
router.post('/login', authLoginLimiter, loginUser);

router.get('/profissionais/all', authenticateToken, requireRole('admin'), getAllProfessionals);
router.put('/:id/suspender', authenticateToken, requireRole('admin'), suspendUser);
router.put('/:id/habilitar', authenticateToken, requireRole('admin'), enableUser);

router.get('/me', authenticateToken, getMe);
router.put('/me', authenticateToken, updateMe);
router.delete('/me', authenticateToken, deleteMe);
router.get('/:id', authenticateTokenRelaxed, getUser);
router.put('/:id', authenticateToken, requireSelfOrAdmin('id'), updateUser);
router.delete('/:id', authenticateToken, requireSelfOrAdmin('id'), deleteUser);

export default router;

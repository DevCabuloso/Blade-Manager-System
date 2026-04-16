import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUser, 
  updateUser, 
  deleteUser,
  getAllProfessionals, 
  suspendUser, 
  enableUser, 
  verifyEmail
} from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Rotas públicas ---
router.post('/', registerUser);
router.post('/login', loginUser);

// Rota de verificação de e-mail
router.get('/verify-email', verifyEmail);

// --- Rotas protegidas ---
router.get('/:id', authenticateToken, getUser);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

router.get('/profissionais/all', authenticateToken, getAllProfessionals);
router.put('/:id/suspender', authenticateToken, suspendUser);
router.put('/:id/habilitar', authenticateToken, enableUser); 

export default router;
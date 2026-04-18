import express from 'express';
import { criarHorario, listarHorarios, listarMeusHorarios, atualizarHorario, deletarHorario } from '../controllers/horariosController.js';
import { authenticateTokenRelaxed } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/authorize.js';

const router = express.Router();

router.get('/me', authenticateTokenRelaxed, requireRole('barbeiro', 'admin'), listarMeusHorarios);
router.get('/:usuarios_id', listarHorarios);
router.post('/', authenticateTokenRelaxed, requireRole('barbeiro', 'admin'), criarHorario);
router.put('/:id', authenticateTokenRelaxed, requireRole('barbeiro', 'admin'), atualizarHorario);
router.delete('/:id', authenticateTokenRelaxed, requireRole('barbeiro', 'admin'), deletarHorario);

export default router;

import express from 'express';
import { criarHorario, listarHorarios, atualizarHorario, deletarHorario } from '../controllers/horariosController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas as rotas são protegidas
router.post('/', authenticateToken, criarHorario);
router.get('/:usuarios_id', authenticateToken, listarHorarios);
router.put('/:id', authenticateToken, atualizarHorario);
router.delete('/:id', authenticateToken, deletarHorario);

export default router;

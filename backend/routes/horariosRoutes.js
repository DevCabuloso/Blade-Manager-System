import express from 'express';
import { criarHorario, listarHorarios, atualizarHorario, deletarHorario } from '../controllers/horariosController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Listar horários não requer autenticação (clientes precisam ver disponibilidade)
router.get('/:usuarios_id', listarHorarios);
// Outras rotas são protegidas
router.post('/', authenticateToken, criarHorario);
router.put('/:id', authenticateToken, atualizarHorario);
router.delete('/:id', authenticateToken, deletarHorario);

export default router;

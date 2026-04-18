import jwt from 'jsonwebtoken';
import { getUserById } from '../utils/userAccess.js';

const getBearerToken = (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET nao configurado.');
  }

  return process.env.JWT_SECRET;
};

export const authenticate = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) return res.status(401).json({ message: 'Token nao fornecido.' });

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const userId = Number(decoded?.id);

    if (!Number.isInteger(userId)) {
      return res.status(401).json({ message: 'Token invalido.' });
    }

    const { data: currentUser, error } = await getUserById(
      userId,
      'id, nome_usuario, email, telefone, tipo_usuario, ativo'
    );

    if (error) {
      console.error('Erro ao consultar usuario autenticado:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!currentUser) {
      return res.status(401).json({ message: 'Sessao invalida.' });
    }

    if (currentUser.ativo === 0) {
      return res.status(401).json({ message: 'Sessao encerrada para esta conta.' });
    }

    req.user = {
      id: currentUser.id,
      nome_usuario: currentUser.nome_usuario,
      email: currentUser.email,
      telefone: currentUser.telefone,
      tipo_usuario: String(currentUser.tipo_usuario || '').trim().toLowerCase(),
      ativo: currentUser.ativo,
    };
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token invalido ou expirado.' });
  }
};

export const authenticateToken = authenticate;

export const authenticateTokenRelaxed = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const userId = Number(decoded?.id);

    if (!Number.isInteger(userId)) {
      return res.status(401).json({ message: 'Token invalido.' });
    }

    const { data: currentUser, error } = await getUserById(
      userId,
      'id, nome_usuario, email, telefone, tipo_usuario, ativo'
    );

    if (error) {
      console.error('Erro ao consultar usuario autenticado:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!currentUser) {
      return res.status(401).json({ message: 'Sessao invalida.' });
    }

    if (currentUser.ativo === 0) {
      return res.status(401).json({ message: 'Sessao encerrada para esta conta.' });
    }

    req.user = {
      id: currentUser.id,
      nome_usuario: currentUser.nome_usuario,
      email: currentUser.email,
      telefone: currentUser.telefone,
      tipo_usuario: String(currentUser.tipo_usuario || '').trim().toLowerCase(),
      ativo: currentUser.ativo,
    };

    return next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token invalido ou expirado.' });
  }
};

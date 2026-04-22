import jwt from 'jsonwebtoken';
import { getUserById, isUserInactive, normalizeUserId } from '../utils/userAccess.js';

const WEAK_JWT_SECRETS = new Set(['seu_segredo', 'secret', 'changeme', 'default']);
let hasWarnedWeakJwtSecret = false;

const getBearerToken = (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
};

const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || '').trim();

  if (!secret) {
    throw new Error('JWT_SECRET nao configurado.');
  }

  const isWeakSecret = secret.length < 32 || WEAK_JWT_SECRETS.has(secret.toLowerCase());
  const enforceStrongSecret = process.env.ENFORCE_STRONG_JWT_SECRET === 'true';

  if (isWeakSecret) {
    if (enforceStrongSecret) {
      throw new Error('JWT_SECRET fraco. Configure um segredo forte com pelo menos 32 caracteres.');
    }

    if (!hasWarnedWeakJwtSecret && process.env.NODE_ENV === 'production') {
      console.warn('JWT_SECRET fraco detectado em producao. Configure ENFORCE_STRONG_JWT_SECRET=true para bloquear.');
      hasWarnedWeakJwtSecret = true;
    }
  }

  return secret;
};

const isRegistrationApproved = (value) => {
  if (value === true || value === 1) return true;

  const normalized = String(value || '').trim().toLowerCase();
  return ['true', '1', 'sim', 'yes'].includes(normalized);
};

export const authenticate = async (req, res, next) => {
  const token = getBearerToken(req);

  if (!token) return res.status(401).json({ message: 'Token nao fornecido.' });

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const userId = normalizeUserId(decoded?.id);

    if (userId === null) {
      return res.status(401).json({ message: 'Token invalido.' });
    }

    const { data: currentUser, error } = await getUserById(userId);

    if (error) {
      console.error('Erro ao consultar usuario autenticado:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!currentUser) {
      return res.status(401).json({ message: 'Sessao invalida.' });
    }

    if (!isRegistrationApproved(currentUser.email_verificado)) {
      return res.status(401).json({ message: 'Sessao encerrada: cadastro pendente de aprovacao.' });
    }

    if (isUserInactive(currentUser.ativo)) {
      return res.status(401).json({ message: 'Sessao encerrada para esta conta.' });
    }

    req.user = {
      id: normalizeUserId(currentUser.id),
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
    const userId = normalizeUserId(decoded?.id);

    if (userId === null) {
      return res.status(401).json({ message: 'Token invalido.' });
    }

    const { data: currentUser, error } = await getUserById(userId);

    if (error) {
      console.error('Erro ao consultar usuario autenticado:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!currentUser) {
      return res.status(401).json({ message: 'Sessao invalida.' });
    }

    if (!isRegistrationApproved(currentUser.email_verificado)) {
      return res.status(401).json({ message: 'Sessao encerrada: cadastro pendente de aprovacao.' });
    }

    if (isUserInactive(currentUser.ativo)) {
      return res.status(401).json({ message: 'Sessao encerrada para esta conta.' });
    }

    req.user = {
      id: normalizeUserId(currentUser.id),
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

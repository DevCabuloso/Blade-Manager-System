import { normalizeUserId } from '../utils/userAccess.js';

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const authenticatedUserId = normalizeUserId(req.user?.id);

    if (authenticatedUserId === null) {
      return res.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    req.user.id = authenticatedUserId;

    if (!allowedRoles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    next();
  };
};

export const requireSelfOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    const authenticatedUserId = normalizeUserId(req.user?.id);

    if (authenticatedUserId === null) {
      return res.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const targetId = normalizeUserId(req.params[paramName]);
    if (targetId === null) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    req.user.id = authenticatedUserId;

    if (req.user.tipo_usuario === 'admin' || authenticatedUserId === targetId) {
      return next();
    }

    return res.status(403).json({ message: 'Nao autorizado.' });
  };
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!Number.isInteger(req.user?.id)) {
      return res.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    if (!allowedRoles.includes(req.user.tipo_usuario)) {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    next();
  };
};

export const requireSelfOrAdmin = (paramName = 'id') => {
  return (req, res, next) => {
    if (!Number.isInteger(req.user?.id)) {
      return res.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const targetId = Number(req.params[paramName]);
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    if (req.user.tipo_usuario === 'admin' || req.user.id === targetId) {
      return next();
    }

    return res.status(403).json({ message: 'Nao autorizado.' });
  };
};

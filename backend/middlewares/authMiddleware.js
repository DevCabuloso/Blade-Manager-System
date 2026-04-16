import jwt from 'jsonwebtoken';
import supabase from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo');
    req.user = decoded;

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('email_verificado')
      .eq('id', decoded.id)
      .single();

    if (error) return res.status(500).json({ message: 'Erro interno ao verificar e-mail.' });
    if (!user || !user.email_verificado)
      return res.status(403).json({ message: 'E-mail não verificado.' });

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

// Middleware alternativo: valida o JWT mas NÃO exige que o e-mail esteja verificado.
export const authenticateTokenRelaxed = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo');
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

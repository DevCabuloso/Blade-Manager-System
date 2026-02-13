import express from 'express';
import supabase from '../config/db.js';

const router = express.Router();

// Rota GET para verificar email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(400).send('Token inválido');

  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (error || !user) return res.status(400).send('Token inválido ou expirado');

    await supabase
      .from('usuarios')
      .update({ email_verificado: true, verification_token: null })
      .eq('id', user.id);

    // Redireciona para a página de login (frontend)
    const frontendBase = process.env.APP_BASE_URL || 'http://localhost:5173';
    res.redirect(`${frontendBase}/login`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno');
  }
});

export default router;

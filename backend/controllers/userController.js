import supabase from '../config/db.js';
import transporter from '../config/mailer.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// --- Registro de usuário ---
export const registerUser = async (req, res) => {
  const { nome_usuario, email, senha, telefone, tipo_usuario } = req.body;
  if (!nome_usuario || !email || !senha)
    return res.status(400).json({ message: 'Campos obrigatórios faltando.' });

  try {
    const { data: existing, error: errCheck } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (errCheck) {
      console.error('Erro ao verificar email existente:', errCheck);
      return res.status(500).json({ 
        message: 'Erro ao processar registro. Verifique a conexão com o servidor.',
        error: errCheck.message 
      });
    }

    if (existing && existing.length) return res.status(409).json({ message: 'E-mail já cadastrado.' });

    const hashedPassword = await bcrypt.hash(senha, 10);
    
    // Gerar token de verificação para TODOS os usuários
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nome_usuario,
        email,
        senha: hashedPassword,
        telefone: telefone || null,
        tipo_usuario: tipo_usuario || 'cliente',
        ativo: 1,
        email_verificado: false,
        verification_token: verificationToken,
      }])
      .select('id')
      .limit(1);

    if (error) {
      console.error('Erro ao criar usuário no Supabase:', error);
      return res.status(500).json({ 
        message: 'Erro ao criar usuário. Verifique a conexão com o servidor.',
        error: error.message 
      });
    }

    const userId = data[0].id;

    // Enviar e-mail de verificação para TODOS os usuários
    if (verificationToken) {
      const verificationLink = `${process.env.APP_BASE_URL}/api/usuarios/verify-email?token=${verificationToken}`;

      try {
        const info = await transporter.sendMail({
          from: `"Blade Manager" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Verifique seu e-mail - Blade Manager',
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
              <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 26px; letter-spacing: 1px;">Blade Manager ✂️</h1>
                </div>

                <div style="padding: 30px; color: #333;">
                  <h2 style="margin-top: 0;">Olá, ${nome_usuario}!</h2>
                  <p>Seja bem-vindo(a) ao <strong>Blade Manager</strong>, o sistema de agendamentos que une estilo e praticidade.</p>
                  
                  <p>Antes de continuar, precisamos confirmar seu e-mail para garantir sua segurança.</p>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${verificationLink}"
                      style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none;
                             border-radius: 6px; font-weight: bold; letter-spacing: 0.5px; transition: 0.3s;">
                      ✅ Validar meu e-mail
                    </a>
                  </div>

                  <p>Se o botão acima não funcionar, copie e cole este link no navegador:</p>
                  <p style="word-break: break-all; color: #555;">${verificationLink}</p>

                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

                  <p style="font-size: 13px; color: #777; text-align: center;">
                    Este e-mail foi enviado automaticamente. Por favor, não responda.<br>
                    &copy; ${new Date().getFullYear()} Blade Manager. Todos os direitos reservados.
                  </p>
                </div>
              </div>
            </div>
          `,
        });
        console.log('✅ Email de verificação enviado com sucesso para:', email);
        console.log('📧 Response ID:', info.response);
      } catch (emailErr) {
        console.error('❌ Erro ao enviar email de verificação:', emailErr.message);
        console.error('📋 Detalhes:', emailErr);
        // Não interromper o fluxo se o email falhar, apenas avisar no log
        return res.status(500).json({ 
          message: 'Usuário criado, mas houve erro ao enviar email de verificação. Tente novamente mais tarde.',
          error: emailErr.message 
        });
      }
    }

    // Mensagem de confirmação
    const mensagem = 'Usuário criado com sucesso! Verifique seu e-mail para ativar sua conta.';

    res.status(201).json({ message: mensagem, userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- Login de usuário ---
export const loginUser = async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ message: 'Campos obrigatórios faltando.' });

  try {
    const { data: rows } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (!rows || rows.length === 0) return res.status(401).json({ message: 'Usuário não encontrado.' });

    const user = rows[0];

    if (user.ativo === 0) return res.status(403).json({ message: 'Conta suspensa, entre em contato com os administradores.' });

    if (!user.email_verificado) {
      return res.status(403).json({ message: 'E-mail não verificado. Verifique seu e-mail.' });
    }

    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) return res.status(401).json({ message: 'Senha incorreta.' });

    const token = jwt.sign({ id: user.id, tipo_usuario: user.tipo_usuario }, process.env.JWT_SECRET || 'seu_segredo', { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, nome_usuario: user.nome_usuario, tipo_usuario: user.tipo_usuario } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- Verificação de e-mail ---
export const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Token inválido');

  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('verification_token', token)
      .single();

    if (error || !user) return res.status(400).send('Token inválido ou expirado');

    // Atualiza o usuário
    await supabase
      .from('usuarios')
      .update({ email_verificado: true, verification_token: null })
      .eq('id', user.id);

    // Redireciona ou retorna sucesso
    res.redirect(`${process.env.APP_BASE_URL}/login?verified=true`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno');
  }
};
// --- Buscar usuário ---
export const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: rows, error } = await supabase
      .from('usuarios')
      .select('id, nome_usuario, email, telefone, tipo_usuario, ativo')
      .eq('id', Number(id))
      .limit(1);

    if (error) return res.status(500).json({ message: 'Erro interno.' });
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const user = rows[0];

    if (parseInt(id) !== req.user.id) {
      return res.json({ telefone: user.telefone });
    }

    const profileLink = `${process.env.APP_BASE_URL}/?profissionalId=${id}`;
    res.json({ ...user, profileLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- Atualizar usuário ---
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nome_usuario, telefone, email, nova_senha } = req.body;
  try {
    if (parseInt(id) !== req.user.id) return res.status(403).json({ message: 'Não autorizado.' });

    const updates = {};
    if (nome_usuario) updates.nome_usuario = nome_usuario;
    if (telefone) updates.telefone = telefone;

    if (email) {
      const { data: existing, error: errExisting } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .neq('id', Number(id))
        .limit(1);

      if (errExisting) return res.status(500).json({ message: 'Erro interno.' });
      if (existing && existing.length) return res.status(409).json({ message: 'E-mail já cadastrado.' });
      updates.email = email;
    }

    if (nova_senha) updates.senha = await bcrypt.hash(nova_senha, 10);

    if (!Object.keys(updates).length) return res.json({ message: 'Nada para atualizar.' });

    const { data: updatedUserData, error: errUpdate } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', Number(id))
      .select('id, nome_usuario, email, telefone, tipo_usuario, ativo')
      .limit(1);

    if (errUpdate) return res.status(500).json({ message: 'Erro interno.' });

    const updatedUser = updatedUserData[0];
    const profileLink = `${process.env.APP_BASE_URL}/?profissionalId=${id}`;
    res.json({ message: 'Perfil atualizado!', ...updatedUser, profileLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- Deletar usuário e dados relacionados ---
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (parseInt(id) !== req.user.id && req.user.tipo_usuario !== 'admin')
      return res.status(403).json({ message: 'Não autorizado.' });

    const { data: user, error: errSelect } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', Number(id))
      .limit(1);

    if (errSelect) return res.status(500).json({ message: 'Erro interno.' });
    if (!user || !user.length) return res.status(404).json({ message: 'Usuário não encontrado.' });

    // Deletar serviços e agendamentos relacionados
    await supabase.from('servicos').delete().eq('barbeiro_id', Number(id));
    await supabase.from('agendamentos').delete().eq('barbeiro_id', Number(id));

    await supabase.from('usuarios').delete().eq('id', Number(id));
    res.json({ message: 'Conta excluída!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- Buscar profissionais ---
export const getAllProfessionals = async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('usuarios')
      .select('id, nome_usuario, email, telefone, tipo_usuario, ativo')
      .eq('tipo_usuario', 'barbeiro');

    if (error) return res.status(500).json({ message: 'Erro ao buscar profissionais.' });

    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar profissionais.' });
  }
};

// --- Suspender usuário ---
export const suspendUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', Number(id))
      .limit(1);

    if (error) return res.status(500).json({ message: 'Erro ao suspender usuário.' });
    if (!user || !user.length) return res.status(404).json({ message: 'Usuário não encontrado.' });

    await supabase.from('usuarios').update({ ativo: 0 }).eq('id', Number(id));
    res.json({ message: 'Usuário suspenso com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao suspender usuário.' });
  }
};

// --- Habilitar usuário ---
export const enableUser = async (req, res) => {
  const { id } = req.params;
  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', Number(id))
      .limit(1);

    if (error) return res.status(500).json({ message: 'Erro ao habilitar usuário.' });
    if (!user || !user.length) return res.status(404).json({ message: 'Usuário não encontrado.' });

    await supabase.from('usuarios').update({ ativo: 1 }).eq('id', Number(id));
    res.json({ message: 'Usuário habilitado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao habilitar usuário.' });
  }
};

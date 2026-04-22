import supabase from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {
  validateHorarioPayload,
  validatePasswordInput,
  validatePhoneNumber,
  validateUserPayload,
  validateDisplayName,
  validateEmailAddress,
} from '../utils/validation.js';
import { isUserInactive, normalizeUserId } from '../utils/userAccess.js';

const WEAK_JWT_SECRETS = new Set(['seu_segredo', 'secret', 'changeme', 'default']);
let hasWarnedWeakJwtSecret = false;

dotenv.config();

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

const buildProfileLink = (req, targetId) => {
  const configuredFrontendUrl = String(process.env.APP_BASE_URL || process.env.FRONTEND_URL || '').trim();
  const requestOrigin = String(req.get('origin') || '').trim();
  const fallbackHostUrl = `${req.protocol}://${req.get('host')}`;

  const baseUrl = configuredFrontendUrl || requestOrigin || fallbackHostUrl;

  return `${baseUrl.replace(/\/$/, '')}/agendar/${targetId}`;
};

const isRegistrationApproved = (value) => {
  if (value === true || value === 1) return true;

  const normalized = String(value || '').trim().toLowerCase();
  return ['true', '1', 'sim', 'yes'].includes(normalized);
};

// --- Registro de usuario ---
export const registerUser = async (req, res) => {
  const { tipo_usuario } = req.body;
  const horarios = Array.isArray(req.body?.horarios) ? req.body.horarios : [];
  const requestedRole = String(tipo_usuario || 'cliente').trim().toLowerCase();
  const allowedPublicRoles = new Set(['cliente', 'barbeiro']);

  if (!allowedPublicRoles.has(requestedRole)) {
    return res.status(403).json({ message: 'Tipo de usuario nao permitido para auto cadastro.' });
  }

  const userValidation = validateUserPayload({
    nome_usuario: req.body?.nome_usuario,
    email: req.body?.email,
    telefone: req.body?.telefone,
    senha: req.body?.senha,
    requirePhone: requestedRole === 'barbeiro',
    requirePassword: true,
  });

  if (!userValidation.ok) {
    return res.status(400).json({ message: userValidation.message });
  }

  const {
    nome_usuario,
    email,
    telefone,
    senha,
  } = userValidation.value;

  try {
    const { data: existing, error: errCheck } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (errCheck) {
      console.error('Erro ao verificar email existente:', errCheck);
      return res.status(500).json({
        message: 'Erro ao processar registro. Verifique a conexao com o servidor.'
      });
    }

    if (existing && existing.length) {
      return res.status(409).json({ message: 'E-mail ja cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nome_usuario,
        email,
        senha: hashedPassword,
        telefone: telefone || null,
        tipo_usuario: requestedRole,
        ativo: 1,
        email_verificado: false,
      }])
      .select('id')
      .limit(1);

    if (error) {
      console.error('Erro ao criar usuario no Supabase:', error);
      return res.status(500).json({
        message: 'Erro ao criar usuario. Verifique a conexao com o servidor.'
      });
    }

    const userId = data[0].id;

    if (requestedRole === 'barbeiro' && horarios.length > 0) {
      const validatedHorarios = [];

      for (const horario of horarios) {
        if (!horario || !horario.dia_semana || !horario.hora_abertura || !horario.hora_fechamento) {
          continue;
        }

        const validation = validateHorarioPayload(horario);
        if (!validation.ok) {
          await supabase.from('usuarios').delete().eq('id', userId);
          return res.status(400).json({ message: `Horario inicial invalido: ${validation.message}` });
        }

        validatedHorarios.push({
          usuarios_id: userId,
          ...validation.value,
        });
      }

      if (validatedHorarios.length > 0) {
        const { error: horariosError } = await supabase
          .from('horarios')
          .insert(validatedHorarios);

        if (horariosError) {
          console.error('Erro ao salvar horarios no cadastro:', horariosError);
          await supabase.from('usuarios').delete().eq('id', userId);
          return res.status(500).json({
            message: 'Erro ao criar horarios iniciais do profissional.'
          });
        }
      }
    }

    res.status(201).json({
      message: 'Cadastro enviado com sucesso! Aguarde a aprovacao de um administrador para acessar a conta.',
      userId,
      registrationPending: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- Login de usuario ---
export const loginUser = async (req, res) => {
  const emailValidation = validateEmailAddress(req.body?.email);
  const passwordValidation = validatePasswordInput(req.body?.senha, {
    required: true,
    enforceMaxLength: false,
  });

  if (!emailValidation.ok) {
    return res.status(400).json({ message: emailValidation.message });
  }

  if (!passwordValidation.ok) {
    return res.status(400).json({ message: passwordValidation.message });
  }

  const email = emailValidation.value;
  const senha = passwordValidation.value;

  try {
    const { data: rows } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'Credenciais invalidas.' });
    }

    const user = rows[0];

    if (!isRegistrationApproved(user.email_verificado)) {
      return res.status(403).json({ message: 'Cadastro pendente de aprovacao do administrador.' });
    }

    if (isUserInactive(user.ativo)) {
      return res.status(403).json({ message: 'Conta suspensa, entre em contato com os administradores.' });
    }

    const validPassword = await bcrypt.compare(senha, user.senha);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciais invalidas.' });
    }

    const token = jwt.sign(
      { id: user.id, tipo_usuario: user.tipo_usuario },
      getJwtSecret(),
      { expiresIn: '1d' }
    );

    res.json({
      token,
      message: 'Login realizado com sucesso!',
      user: {
        id: normalizeUserId(user.id) ?? user.id,
        nome_usuario: user.nome_usuario,
        tipo_usuario: user.tipo_usuario
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- Buscar usuario ---
export const getUser = async (req, res) => {
  const targetId = normalizeUserId(req.params.id);

  try {
    if (targetId === null) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    const { data: rows, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', targetId)
      .limit(1);

    if (error) return res.status(500).json({ message: 'Erro interno.' });
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Usuario nao encontrado.' });

    const user = rows[0];
    const isSelf = req.user?.id === targetId;
    const isAdmin = req.user?.tipo_usuario === 'admin';
    const isPublicProfessional = user.tipo_usuario === 'barbeiro';
    const registrationApproved = isRegistrationApproved(user.email_verificado);

    if (isSelf || isAdmin) {
      const profileLink = buildProfileLink(req, targetId);
      return res.json({ ...user, profileLink });
    }

    if (!isPublicProfessional || !registrationApproved || isUserInactive(user.ativo)) {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    return res.json({
      id: user.id,
      nome_usuario: user.nome_usuario,
      telefone: user.telefone,
      tipo_usuario: user.tipo_usuario,
      ativo: user.ativo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const getMe = async (req, res) => {
  const authenticatedUserId = normalizeUserId(req.user?.id);

  if (authenticatedUserId === null) {
    return res.status(401).json({ message: 'Usuario nao autenticado.' });
  }

  req.params.id = authenticatedUserId;
  return getUser(req, res);
};

// --- Atualizar usuario ---
export const updateUser = async (req, res) => {
  const targetId = normalizeUserId(req.params.id);
  const { nome_usuario, telefone, email, nova_senha } = req.body;

  try {
    if (targetId === null) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    if (targetId !== req.user.id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    const updates = {};
    if (nome_usuario !== undefined) {
      const nameValidation = validateDisplayName(nome_usuario, { label: 'Nome' });
      if (!nameValidation.ok) {
        return res.status(400).json({ message: nameValidation.message });
      }

      updates.nome_usuario = nameValidation.value;
    }

    if (telefone !== undefined) {
      const phoneValidation = validatePhoneNumber(telefone, { required: false });
      if (!phoneValidation.ok) {
        return res.status(400).json({ message: phoneValidation.message });
      }

      updates.telefone = phoneValidation.value;
    }

    if (email) {
      const emailValidation = validateEmailAddress(email);
      if (!emailValidation.ok) {
        return res.status(400).json({ message: emailValidation.message });
      }

      const normalizedEmail = emailValidation.value;
      const { data: existing, error: errExisting } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', normalizedEmail)
        .neq('id', targetId)
        .limit(1);

      if (errExisting) return res.status(500).json({ message: 'Erro interno.' });
      if (existing && existing.length) return res.status(409).json({ message: 'E-mail ja cadastrado.' });
      updates.email = normalizedEmail;
    }

    if (nova_senha) {
      const passwordValidation = validatePasswordInput(nova_senha, { required: true });
      if (!passwordValidation.ok) {
        return res.status(400).json({ message: passwordValidation.message });
      }

      updates.senha = await bcrypt.hash(passwordValidation.value, 10);
    }

    if (!Object.keys(updates).length) return res.json({ message: 'Nada para atualizar.' });

    const { data: updatedUserData, error: errUpdate } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', targetId)
      .select('id, nome_usuario, email, telefone, tipo_usuario, ativo')
      .limit(1);

    if (errUpdate) return res.status(500).json({ message: 'Erro interno.' });

    const updatedUser = updatedUserData[0];
    const profileLink = buildProfileLink(req, targetId);
    res.json({ message: 'Perfil atualizado!', ...updatedUser, profileLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const updateMe = async (req, res) => {
  req.params.id = req.user?.id;
  return updateUser(req, res);
};

// --- Deletar usuario e dados relacionados ---
export const deleteUser = async (req, res) => {
  const targetId = Number(req.params.id);

  try {
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    if (targetId !== req.user.id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    const { data: user, error: errSelect } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', targetId)
      .limit(1);

    if (errSelect) return res.status(500).json({ message: 'Erro interno.' });
    if (!user || !user.length) return res.status(404).json({ message: 'Usuario nao encontrado.' });

    const executeDelete = async (query, errorMessage) => {
      const { error: deleteError } = await query;
      if (deleteError) {
        console.error(errorMessage, deleteError);
        return false;
      }

      return true;
    };

    const deletedClientAppointments = await executeDelete(
      supabase.from('agendamentos').delete().eq('cliente_id', targetId),
      'Erro ao excluir agendamentos do cliente:'
    );
    if (!deletedClientAppointments) {
      return res.status(500).json({ message: 'Erro ao excluir conta.' });
    }

    const deletedBarberAppointments = await executeDelete(
      supabase.from('agendamentos').delete().eq('barbeiro_id', targetId),
      'Erro ao excluir agendamentos do profissional:'
    );
    if (!deletedBarberAppointments) {
      return res.status(500).json({ message: 'Erro ao excluir conta.' });
    }

    const deletedSchedules = await executeDelete(
      supabase.from('horarios').delete().eq('usuarios_id', targetId),
      'Erro ao excluir horarios do usuario:'
    );
    if (!deletedSchedules) {
      return res.status(500).json({ message: 'Erro ao excluir conta.' });
    }

    const deletedServices = await executeDelete(
      supabase.from('servicos').delete().eq('barbeiro_id', targetId),
      'Erro ao excluir servicos do usuario:'
    );
    if (!deletedServices) {
      return res.status(500).json({ message: 'Erro ao excluir conta.' });
    }

    const deletedUser = await executeDelete(
      supabase.from('usuarios').delete().eq('id', targetId),
      'Erro ao excluir usuario:'
    );
    if (!deletedUser) {
      return res.status(500).json({ message: 'Erro ao excluir conta.' });
    }

    res.json({ message: 'Conta excluida!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const deleteMe = async (req, res) => {
  req.params.id = req.user?.id;
  return deleteUser(req, res);
};

// --- Buscar profissionais ---
export const getAllProfessionals = async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('usuarios')
      .select('id, nome_usuario, email, telefone, tipo_usuario, ativo')
      .eq('tipo_usuario', 'barbeiro')
      .eq('email_verificado', true);

    if (error) return res.status(500).json({ message: 'Erro ao buscar profissionais.' });

    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar profissionais.' });
  }
};

export const getPendingRegistrations = async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('usuarios')
      .select('id, nome_usuario, email, telefone, tipo_usuario, ativo, email_verificado')
      .eq('email_verificado', false)
      .order('id', { ascending: false });

    if (error) {
      console.error('Erro ao buscar solicitacoes de cadastro:', error);
      return res.status(500).json({ message: 'Erro ao buscar solicitacoes de cadastro.' });
    }

    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar solicitacoes de cadastro.' });
  }
};

export const approveRegistration = async (req, res) => {
  const targetId = Number(req.params.id);

  try {
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    const { data: rows, error } = await supabase
      .from('usuarios')
      .select('id, email_verificado')
      .eq('id', targetId)
      .limit(1);

    if (error) {
      console.error('Erro ao buscar usuario para aprovacao:', error);
      return res.status(500).json({ message: 'Erro ao aprovar cadastro.' });
    }

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Usuario nao encontrado.' });
    }

    const user = rows[0];
    if (isRegistrationApproved(user.email_verificado)) {
      return res.json({ message: 'Cadastro ja aprovado.' });
    }

    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ email_verificado: true, ativo: 1 })
      .eq('id', targetId);

    if (updateError) {
      console.error('Erro ao atualizar aprovacao de cadastro:', updateError);
      return res.status(500).json({ message: 'Erro ao aprovar cadastro.' });
    }

    return res.json({ message: 'Cadastro aprovado com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao aprovar cadastro.' });
  }
};

// --- Suspender usuario ---
export const suspendUser = async (req, res) => {
  const targetId = Number(req.params.id);

  try {
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', targetId)
      .limit(1);

    if (error) return res.status(500).json({ message: 'Erro ao suspender usuario.' });
    if (!user || !user.length) return res.status(404).json({ message: 'Usuario nao encontrado.' });

    await supabase.from('usuarios').update({ ativo: 0 }).eq('id', targetId);
    res.json({ message: 'Usuario suspenso com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao suspender usuario.' });
  }
};

// --- Habilitar usuario ---
export const enableUser = async (req, res) => {
  const targetId = Number(req.params.id);

  try {
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', targetId)
      .limit(1);

    if (error) return res.status(500).json({ message: 'Erro ao habilitar usuario.' });
    if (!user || !user.length) return res.status(404).json({ message: 'Usuario nao encontrado.' });

    await supabase.from('usuarios').update({ ativo: 1 }).eq('id', targetId);
    res.json({ message: 'Usuario habilitado com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao habilitar usuario.' });
  }
};

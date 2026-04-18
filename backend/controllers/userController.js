import supabase from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validateHorarioPayload } from '../utils/validation.js';

dotenv.config();

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET nao configurado.');
  }

  return process.env.JWT_SECRET;
};

// --- Registro de usuario ---
export const registerUser = async (req, res) => {
  const { nome_usuario, senha, telefone, tipo_usuario } = req.body;
  const horarios = Array.isArray(req.body?.horarios) ? req.body.horarios : [];
  const email = String(req.body?.email || '').trim().toLowerCase();
  const requestedRole = String(tipo_usuario || 'cliente').trim().toLowerCase();
  const allowedPublicRoles = new Set(['cliente', 'barbeiro']);

  if (!nome_usuario || !email || !senha) {
    return res.status(400).json({ message: 'Campos obrigatorios faltando.' });
  }

  if (!allowedPublicRoles.has(requestedRole)) {
    return res.status(403).json({ message: 'Tipo de usuario nao permitido para auto cadastro.' });
  }

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
        email_verificado: true,
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

    res.status(201).json({ message: 'Usuario criado com sucesso!', userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- Login de usuario ---
export const loginUser = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const { senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Campos obrigatorios faltando.' });
  }

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

    if (user.ativo === 0) {
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
      user: { id: user.id, nome_usuario: user.nome_usuario, tipo_usuario: user.tipo_usuario }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

// --- Buscar usuario ---
export const getUser = async (req, res) => {
  const targetId = Number(req.params.id);

  try {
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    const { data: rows, error } = await supabase
      .from('usuarios')
      .select('id, nome_usuario, email, telefone, tipo_usuario, ativo')
      .eq('id', targetId)
      .limit(1);

    if (error) return res.status(500).json({ message: 'Erro interno.' });
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Usuario nao encontrado.' });

    const user = rows[0];
    const isSelf = req.user?.id === targetId;
    const isAdmin = req.user?.tipo_usuario === 'admin';
    const isPublicProfessional = user.tipo_usuario === 'barbeiro';

    if (isSelf || isAdmin) {
      const profileLink = `${process.env.APP_BASE_URL}/?profissionalId=${targetId}`;
      return res.json({ ...user, profileLink });
    }

    if (!isPublicProfessional) {
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
  req.params.id = req.user?.id;
  return getUser(req, res);
};

// --- Atualizar usuario ---
export const updateUser = async (req, res) => {
  const targetId = Number(req.params.id);
  const { nome_usuario, telefone, email, nova_senha } = req.body;

  try {
    if (!Number.isInteger(targetId)) {
      return res.status(400).json({ message: 'Identificador invalido.' });
    }

    if (targetId !== req.user.id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    const updates = {};
    if (nome_usuario) updates.nome_usuario = nome_usuario;
    if (telefone) updates.telefone = telefone;

    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
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

    if (nova_senha) updates.senha = await bcrypt.hash(nova_senha, 10);

    if (!Object.keys(updates).length) return res.json({ message: 'Nada para atualizar.' });

    const { data: updatedUserData, error: errUpdate } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', targetId)
      .select('id, nome_usuario, email, telefone, tipo_usuario, ativo')
      .limit(1);

    if (errUpdate) return res.status(500).json({ message: 'Erro interno.' });

    const updatedUser = updatedUserData[0];
    const profileLink = `${process.env.APP_BASE_URL}/?profissionalId=${targetId}`;
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
      .eq('tipo_usuario', 'barbeiro');

    if (error) return res.status(500).json({ message: 'Erro ao buscar profissionais.' });

    res.json(rows || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar profissionais.' });
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

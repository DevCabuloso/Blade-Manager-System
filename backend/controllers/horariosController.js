import supabase from '../config/db.js';
import { getProfessionalAvailability } from '../utils/userAccess.js';
import { validateHorarioPayload } from '../utils/validation.js';

export const criarHorario = async (req, res) => {
  try {
    const usuarios_id = req.user?.id;
    const validation = validateHorarioPayload(req.body || {});

    if (!usuarios_id) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatorios.' });
    }

    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }

    const { data, error } = await supabase
      .from('horarios')
      .insert([{ usuarios_id, ...validation.value }])
      .select('*');

    if (error) {
      console.error('Supabase error creating horario:', error);
      return res.status(500).json({ message: 'Erro ao criar horario.' });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro ao criar horario:', error);
    res.status(500).json({ message: 'Erro ao criar horario de funcionamento.' });
  }
};

export const listarHorarios = async (req, res) => {
  try {
    const { usuarios_id } = req.params;
    const { professional, horarios, error } = await getProfessionalAvailability(usuarios_id);

    if (error) {
      console.error('Supabase error listing horarios:', error);
      return res.status(500).json({ message: 'Erro ao listar horarios.' });
    }

    if (!professional || professional.ativo === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(horarios || []);
  } catch (error) {
    console.error('Erro ao listar horarios:', error);
    res.status(500).json({ message: 'Erro ao listar horarios.' });
  }
};

export const listarMeusHorarios = async (req, res) => {
  req.params.usuarios_id = req.user?.id;
  return listarHorarios(req, res);
};

export const atualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const validation = validateHorarioPayload(req.body || {});

    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }

    const { data: existingRows, error: errExisting } = await supabase
      .from('horarios')
      .select('id, usuarios_id')
      .eq('id', Number(id))
      .limit(1);

    if (errExisting) {
      console.error('Supabase error updating horario:', errExisting);
      return res.status(500).json({ message: 'Erro ao atualizar horario.' });
    }

    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ message: 'Horario nao encontrado.' });
    }

    if (existingRows[0].usuarios_id !== req.user.id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    const { data, error } = await supabase
      .from('horarios')
      .update(validation.value)
      .eq('id', Number(id))
      .select('*');

    if (error) {
      console.error('Supabase error updating horario:', error);
      return res.status(500).json({ message: 'Erro ao atualizar horario.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Horario nao encontrado.' });
    }

    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Erro ao atualizar horario:', error);
    res.status(500).json({ message: 'Erro ao atualizar horario.' });
  }
};

export const deletarHorario = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existingRows, error: errExisting } = await supabase
      .from('horarios')
      .select('id, usuarios_id')
      .eq('id', Number(id))
      .limit(1);

    if (errExisting) {
      console.error('Supabase error deleting horario:', errExisting);
      return res.status(500).json({ message: 'Erro ao deletar horario.' });
    }

    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ message: 'Horario nao encontrado.' });
    }

    if (existingRows[0].usuarios_id !== req.user.id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    const { data, error } = await supabase
      .from('horarios')
      .delete()
      .eq('id', Number(id))
      .select('*');

    if (error) {
      console.error('Supabase error deleting horario:', error);
      return res.status(500).json({ message: 'Erro ao deletar horario.' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Horario nao encontrado.' });
    }

    res.status(200).json({ message: 'Horario removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar horario:', error);
    res.status(500).json({ message: 'Erro ao deletar horario.' });
  }
};

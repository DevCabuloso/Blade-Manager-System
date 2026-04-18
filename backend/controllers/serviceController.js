import supabase from '../config/db.js';
import { getProfessionalAvailability } from '../utils/userAccess.js';
import { validateServicePayload } from '../utils/validation.js';

export const getServices = async (req, res) => {
  const { profissionalId } = req.params;

  try {
    console.log('getServices called with profissionalId:', profissionalId);

    if (!Number.isInteger(Number(profissionalId))) {
      return res.status(400).json({ message: 'ID do profissional invalido.' });
    }

    const { professional, error: professionalError } = await getProfessionalAvailability(profissionalId);

    if (professionalError) {
      console.error('Supabase error getServices professional:', professionalError);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!professional || professional.ativo === 0) {
      return res.json([]);
    }

    const { data: rows, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('barbeiro_id', Number(profissionalId))
      .not('nome', 'is', null)
      .not('preco', 'is', null)
      .not('duracao_minutos', 'is', null);

    if (error) {
      console.error('Supabase error getServices:', error);
      return res.status(500).json({ message: 'Erro interno.', details: error.message || error });
    }

    res.json(rows || []);
  } catch (err) {
    console.error('Erro ao buscar servicos:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const getOwnServices = async (req, res) => {
  req.params.profissionalId = req.user?.id;
  return getServices(req, res);
};

export const createService = async (req, res) => {
  const barbeiro_id = req.user?.id;
  const validation = validateServicePayload(req.body || {});

  if (!barbeiro_id) {
    return res.status(400).json({ message: 'Campos obrigatorios faltando.' });
  }

  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    const { data, error } = await supabase
      .from('servicos')
      .insert([{ ...validation.value, barbeiro_id }])
      .select('id, nome, preco, duracao_minutos, barbeiro_id')
      .limit(1);

    if (error) {
      console.error('Supabase error createService:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    const createdService = data && data[0] ? data[0] : null;
    res.status(201).json({ message: 'Servico criado!', serviceId: createdService?.id || null, service: createdService });
  } catch (err) {
    console.error('Erro ao criar servico:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const validation = validateServicePayload(req.body || {});

  if (!validation.ok) {
    return res.status(400).json({ message: validation.message });
  }

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const { data: service, error: errSelect } = await supabase
      .from('servicos')
      .select('barbeiro_id')
      .eq('id', Number(id))
      .limit(1);

    if (errSelect) {
      console.error('Supabase error selecting service:', errSelect);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!service || service.length === 0) {
      return res.status(404).json({ message: 'Servico nao encontrado.' });
    }

    if (service[0].barbeiro_id !== req.user.id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    const { data: updated, error: errUpdate } = await supabase
      .from('servicos')
      .update(validation.value)
      .eq('id', Number(id))
      .select('id, nome, preco, duracao_minutos, barbeiro_id');

    if (errUpdate) {
      console.error('Supabase error updateService:', errUpdate);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: 'Servico nao encontrado.' });
    }

    res.json({ message: 'Servico atualizado!', service: updated[0] });
  } catch (err) {
    console.error('Erro ao atualizar servico:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuario nao autenticado.' });
    }

    const { data: service, error: errSelect } = await supabase
      .from('servicos')
      .select('barbeiro_id')
      .eq('id', Number(id))
      .limit(1);

    if (errSelect) {
      console.error('Supabase error selecting service for delete:', errSelect);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!service || service.length === 0) {
      return res.status(404).json({ message: 'Servico nao encontrado.' });
    }

    if (service[0].barbeiro_id !== req.user.id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ message: 'Nao autorizado.' });
    }

    const { data: deleted, error: errDelete } = await supabase
      .from('servicos')
      .delete()
      .eq('id', Number(id))
      .select('id');

    if (errDelete) {
      console.error('Supabase error deleteService:', errDelete);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ message: 'Servico nao encontrado.' });
    }

    res.json({ message: 'Servico excluido!' });
  } catch (err) {
    console.error('Erro ao excluir servico:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

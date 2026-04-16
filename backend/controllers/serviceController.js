import supabase from '../config/db.js';


export const getServices = async (req, res) => {
  const { profissionalId } = req.params;
  try {
    console.log('getServices called with profissionalId:', profissionalId);
    if (!Number.isInteger(Number(profissionalId))) {
      return res.status(400).json({ message: 'ID do profissional inválido.' });
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
      // Em dev, retornar detalhes para facilitar o debug localmente.
      // Se estiver em produção, remova `details` ou substitua por uma mensagem genérica.
      return res.status(500).json({ message: 'Erro interno.', details: error.message || error });
    }

    res.json(rows || []);
  } catch (err) {
    console.error('Erro ao buscar serviços:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const createService = async (req, res) => {
  const { nome, preco, duracao_minutos, barbeiro_id } = req.body;
  if (!nome || !preco || !duracao_minutos || !barbeiro_id) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
  }

  try {
    const { data, error } = await supabase
      .from('servicos')
      .insert([{ nome, preco, duracao_minutos, barbeiro_id }])
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase error createService:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    const serviceId = data && data[0] ? data[0].id : null;
    res.status(201).json({ message: 'Serviço criado!', serviceId });
  } catch (err) {
    console.error('Erro ao criar serviço:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { nome, preco, duracao_minutos } = req.body;
   if (!nome || !preco || !duracao_minutos) {
    return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
  }

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
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

    if (!service || service.length === 0 || service[0].barbeiro_id !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado.' });
    }

    const { data: updated, error: errUpdate } = await supabase
      .from('servicos')
      .update({ nome, preco, duracao_minutos })
      .eq('id', Number(id))
      .select('id');

    if (errUpdate) {
      console.error('Supabase error updateService:', errUpdate);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!updated || updated.length === 0) {
      return res.status(404).json({ message: 'Serviço não encontrado.' });
    }

    res.json({ message: 'Serviço atualizado!' });
  } catch (err) {
    console.error('Erro ao atualizar serviço:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
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

    if (!service || service.length === 0 || service[0].barbeiro_id !== req.user.id) {
      return res.status(403).json({ message: 'Não autorizado.' });
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
      return res.status(404).json({ message: 'Serviço não encontrado.' });
    }

    res.json({ message: 'Serviço excluído!' });
  } catch (err) {
    console.error('Erro ao excluir serviço:', err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};;

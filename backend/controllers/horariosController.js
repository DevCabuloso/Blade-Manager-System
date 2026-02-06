import supabase from '../config/db.js';

// Criar horário de funcionamento
export const criarHorario = async (req, res) => {
  try {
    const { usuarios_id, dia_semana, hora_abertura, hora_fechamento } = req.body;

    if (!usuarios_id || !dia_semana || !hora_abertura || !hora_fechamento) {
      return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    const { data, error } = await supabase
      .from('horarios_funcionamento')
      .insert([{ usuarios_id, dia_semana, hora_abertura, hora_fechamento }])
      .select('*');

    if (error) {
      console.error('Supabase error creating horário:', error);
      return res.status(500).json({ message: 'Erro ao criar horário.' });
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro ao criar horário:', error);
    res.status(500).json({ message: 'Erro ao criar horário de funcionamento.' });
  }
};

// Listar horários de um profissional
export const listarHorarios = async (req, res) => {
  try {
    const { usuarios_id } = req.params;

    const { data, error } = await supabase
      .from('horarios_funcionamento')
      .select('*')
      .eq('usuarios_id', Number(usuarios_id))
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase error listing horários:', error);
      return res.status(500).json({ message: 'Erro ao listar horários.' });
    }

    res.status(200).json(data || []);
  } catch (error) {
    console.error('Erro ao listar horários:', error);
    res.status(500).json({ message: 'Erro ao listar horários.' });
  }
};

// Atualizar horário
export const atualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;
    const { dia_semana, hora_abertura, hora_fechamento } = req.body;

    const { data, error } = await supabase
      .from('horarios_funcionamento')
      .update({ dia_semana, hora_abertura, hora_fechamento })
      .eq('id', Number(id))
      .select('*');

    if (error) {
      console.error('Supabase error updating horário:', error);
      return res.status(500).json({ message: 'Erro ao atualizar horário.' });
    }

    if (!data || data.length === 0)
      return res.status(404).json({ message: 'Horário não encontrado.' });

    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    res.status(500).json({ message: 'Erro ao atualizar horário.' });
  }
};

// Deletar horário
export const deletarHorario = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('horarios_funcionamento')
      .delete()
      .eq('id', Number(id))
      .select('*');

    if (error) {
      console.error('Supabase error deleting horário:', error);
      return res.status(500).json({ message: 'Erro ao deletar horário.' });
    }

    if (!data || data.length === 0)
      return res.status(404).json({ message: 'Horário não encontrado.' });

    res.status(200).json({ message: 'Horário removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar horário:', error);
    res.status(500).json({ message: 'Erro ao deletar horário.' });
  }
};

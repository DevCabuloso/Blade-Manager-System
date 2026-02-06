import supabase from '../config/db.js';


export const getAppointments = async (req, res) => {
  console.log('req.user:', req.user); 
  
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Usuário não autenticado' });
  }

  const userId = req.user.id;
  const userType = req.user.tipo_usuario;

  try {
    let query;
    
    if (userType === 'barbeiro') {
      
      query = supabase
        .from('agendamentos')
        .select('id, cliente_id, servico:servicos(id, nome, preco), data_hora, status')
        .eq('barbeiro_id', userId);
    } else {
      
      query = supabase
        .from('agendamentos')
        .select('id, barbeiro_id, servico:servicos(id, nome, preco), data_hora, status')
        .eq('cliente_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error getAppointments:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    
    const rows = (data || []).map(a => ({
      id: a.id,
      client: a.cliente_id,
      barbeiro: a.barbeiro_id,
      service: a.servico ? a.servico.nome : null,
      value: a.servico ? a.servico.preco : null,
      time: a.data_hora,
      status: a.status
    }));

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};


export const createAppointment = async (req, res) => {
  const { servico_id, data_hora, barbeiro_id } = req.body;
  const cliente_id = req.user.id; 

  if (!cliente_id || !barbeiro_id || !servico_id || !data_hora)
    return res.status(400).json({ message: 'Campos obrigatórios faltando.' });

  try {
    
    const { data: existe, error: errExiste } = await supabase
      .from('agendamentos')
      .select('id')
      .eq('barbeiro_id', barbeiro_id)
      .eq('data_hora', data_hora)
      .limit(1);

    if (errExiste) {
      console.error('Supabase error checking appointment exists:', errExiste);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (existe && existe.length > 0) {
      return res.status(400).json({ message: 'Horário já ocupado!' });
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .insert([
        {
          cliente_id,
          barbeiro_id,
          servico_id,
          data_hora,
          status: 'pendente'
        }
      ])
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase error creating appointment:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    const appointmentId = data && data[0] ? data[0].id : null;
    res.status(201).json({ message: 'Agendamento criado!', appointmentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};


export const getAppointmentsByDate = async (req, res) => {
  const { barbeiroId, data } = req.params;
  try {
    if (!barbeiroId || !data) {
      return res.status(400).json({ message: 'Parâmetros obrigatórios faltando.' });
    }

    const start = `${data}T00:00:00Z`;
    const end = `${data}T23:59:59Z`;

    const { data: rows, error } = await supabase
      .from('agendamentos')
      .select('data_hora')
      .eq('barbeiro_id', Number(barbeiroId))
      .gte('data_hora', start)
      .lte('data_hora', end);

    if (error) {
      console.error('Supabase error getAppointmentsByDate:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    const horarios = (rows || []).map(r => {
      try {
        const d = new Date(r.data_hora);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return { horario: `${hh}:${mm}:${ss}` };
      } catch {
        const s = String(r.data_hora);
        return { horario: s.slice(11, 19) };
      }
    });

    res.json(horarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};
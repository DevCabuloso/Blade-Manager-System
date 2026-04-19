import supabase from '../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getProfessionalAvailability } from '../utils/userAccess.js';
import {
  getWeekDayFromDate,
  getSlotMinutes,
  isAlignedToSlot,
  isValidDateString,
  isPastDateTimeInSaoPaulo,
  parseDateTimeString,
  parseStrictInteger,
  parseTimeString,
  rangesOverlap,
} from '../utils/validation.js';

const NON_BLOCKING_APPOINTMENT_STATUSES = new Set([
  'cancelado',
  'cancelada',
  'cancelled',
  'recusado',
  'recusada',
  'rejeitado',
  'rejeitada',
]);

const normalizeAppointmentStatus = (value) => String(value || '').trim().toLowerCase();

const shouldBlockSchedule = (appointment) => {
  const normalizedStatus = normalizeAppointmentStatus(appointment?.status);
  return !NON_BLOCKING_APPOINTMENT_STATUSES.has(normalizedStatus);
};

const getDateRangeFromFilters = (startDate, endDate) => {
  if (!startDate && !endDate) return null;

  const start = typeof startDate === 'string' ? startDate.trim() : '';
  const end = typeof endDate === 'string' ? endDate.trim() : '';

  if (!start || !end) return { error: 'Periodo informado e invalido.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    return { error: 'Formato de data invalido. Use YYYY-MM-DD.' };
  }
  if (!isValidDateString(start) || !isValidDateString(end)) {
    return { error: 'Data invalida informada no filtro.' };
  }
  if (start > end) {
    return { error: 'Data inicial nao pode ser maior que a final.' };
  }

  return {
    startDateTime: `${start} 00:00:00`,
    endDateTime: `${end} 23:59:59`,
  };
};

const getScheduleWindow = (scheduleRow) => {
  const opening = parseTimeString(scheduleRow?.hora_abertura);
  const closing = parseTimeString(scheduleRow?.hora_fechamento);

  if (!opening || !closing || closing.totalMinutes <= opening.totalMinutes) {
    return null;
  }

  return {
    openingMinutes: opening.totalMinutes,
    closingMinutes: closing.totalMinutes,
  };
};

const createGuestCustomer = async () => {
  const guestIdentifier = crypto.randomUUID();
  const generatedPassword = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);

  const { data, error } = await supabase
    .from('usuarios')
    .insert([
      {
        nome_usuario: 'Cliente visitante',
        email: `guest-${guestIdentifier}@blade-manager.local`,
        senha: hashedPassword,
        telefone: null,
        tipo_usuario: 'cliente',
        ativo: 1,
        email_verificado: true,
      },
    ])
    .select('id')
    .limit(1);

  if (error) {
    return { guestUserId: null, error };
  }

  return {
    guestUserId: data?.[0]?.id || null,
    error: null,
  };
};

export const getAppointments = async (req, res) => {
  console.log('req.user:', req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: 'Usuario nao autenticado' });
  }

  const userId = req.user.id;
  const userType = req.user.tipo_usuario;

  try {
    let query;
    const dateRange = getDateRangeFromFilters(req.query?.startDate, req.query?.endDate);

    if (dateRange?.error) {
      return res.status(400).json({ message: dateRange.error });
    }

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

    if (dateRange?.startDateTime && dateRange?.endDateTime) {
      query = query.gte('data_hora', dateRange.startDateTime).lte('data_hora', dateRange.endDateTime);
    }

    query = query.order('data_hora', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error getAppointments:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    const rows = (data || []).map((a) => ({
      id: a.id,
      client: a.cliente_id,
      barbeiro: a.barbeiro_id,
      service: a.servico ? a.servico.nome : null,
      value: a.servico ? a.servico.preco : null,
      time: a.data_hora,
      status: a.status,
    }));

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const createAppointment = async (req, res) => {
  const { servico_id, data_hora, barbeiro_id } = req.body;
  let cliente_id = req.user?.id || null;
  let createdGuestUserId = null;

  if (!barbeiro_id || !servico_id || !data_hora) {
    return res.status(400).json({ message: 'Campos obrigatorios faltando.' });
  }

  try {
    if (req.user && req.user.tipo_usuario !== 'cliente') {
      return res.status(403).json({ message: 'Apenas clientes podem criar agendamentos.' });
    }

    const normalizedBarberId = parseStrictInteger(barbeiro_id);
    const normalizedServiceId = parseStrictInteger(servico_id);
    const requestedDateTime = parseDateTimeString(data_hora);

    if (!normalizedBarberId || !normalizedServiceId) {
      return res.status(400).json({ message: 'Identificadores invalidos.' });
    }

    if (!requestedDateTime) {
      return res.status(400).json({ message: 'Formato de data/hora invalido. Use YYYY-MM-DD HH:MM:SS.' });
    }

    if (isPastDateTimeInSaoPaulo(requestedDateTime.normalized)) {
      return res.status(400).json({ message: 'Nao e permitido agendar no passado.' });
    }

    if (!isAlignedToSlot(requestedDateTime.time, getSlotMinutes())) {
      return res.status(400).json({ message: 'Horario fora da grade de agendamento permitida.' });
    }

    const { professional, horarios, error: professionalError } = await getProfessionalAvailability(normalizedBarberId);

    if (professionalError) {
      console.error('Supabase error validating professional for appointment:', professionalError);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!professional || professional.ativo === 0) {
      return res.status(400).json({ message: 'Profissional indisponivel para agendamento.' });
    }

    const { data: serviceRows, error: serviceError } = await supabase
      .from('servicos')
      .select('id, barbeiro_id, duracao_minutos')
      .eq('id', normalizedServiceId)
      .limit(1);

    if (serviceError) {
      console.error('Supabase error validating service for appointment:', serviceError);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!serviceRows || serviceRows.length === 0) {
      return res.status(404).json({ message: 'Servico nao encontrado.' });
    }

    const service = serviceRows[0];
    if (service.barbeiro_id !== normalizedBarberId) {
      return res.status(400).json({ message: 'Servico nao pertence ao profissional informado.' });
    }

    const serviceDuration = Number(service.duracao_minutos);
    if (!Number.isInteger(serviceDuration) || serviceDuration <= 0) {
      return res.status(400).json({ message: 'Servico com duracao invalida.' });
    }

    const requestedWeekDay = getWeekDayFromDate(requestedDateTime.date);
    const daySchedule = (horarios || []).find((item) => item.dia_semana === requestedWeekDay);

    if (!daySchedule) {
      return res.status(400).json({ message: 'Profissional nao atende no dia informado.' });
    }

    const scheduleWindow = getScheduleWindow(daySchedule);
    if (!scheduleWindow) {
      return res.status(400).json({ message: 'Horario de funcionamento invalido para o profissional.' });
    }

    const appointmentEnd = requestedDateTime.totalMinutes + serviceDuration;
    if (appointmentEnd <= requestedDateTime.totalMinutes) {
      return res.status(400).json({ message: 'Intervalo de agendamento invalido.' });
    }

    if (
      requestedDateTime.totalMinutes < scheduleWindow.openingMinutes ||
      appointmentEnd > scheduleWindow.closingMinutes
    ) {
      return res.status(400).json({ message: 'Horario fora do expediente do profissional.' });
    }

    const dayStart = `${requestedDateTime.date} 00:00:00`;
    const dayEnd = `${requestedDateTime.date} 23:59:59`;

    const { data: existingAppointments, error: errExiste } = await supabase
      .from('agendamentos')
      .select('id, data_hora, status, servico:servicos(duracao_minutos)')
      .eq('barbeiro_id', normalizedBarberId)
      .gte('data_hora', dayStart)
      .lte('data_hora', dayEnd);

    if (errExiste) {
      console.error('Supabase error checking appointment exists:', errExiste);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    const hasOverlap = (existingAppointments || []).some((appointment) => {
      if (!shouldBlockSchedule(appointment)) {
        return false;
      }

      const existingDateTime = parseDateTimeString(appointment?.data_hora);
      const existingDuration = Number(appointment?.servico?.duracao_minutos) || 0;

      if (!existingDateTime || existingDuration <= 0) {
        return appointment?.data_hora === requestedDateTime.normalized;
      }

      return rangesOverlap(
        requestedDateTime.totalMinutes,
        appointmentEnd,
        existingDateTime.totalMinutes,
        existingDateTime.totalMinutes + existingDuration
      );
    });

    if (hasOverlap) {
      return res.status(400).json({ message: 'Horario ja ocupado!' });
    }

    if (!cliente_id) {
      const { guestUserId, error: guestError } = await createGuestCustomer();

      if (guestError) {
        console.error('Supabase error creating guest customer:', guestError);
        return res.status(500).json({ message: 'Erro interno.' });
      }

      if (!guestUserId) {
        return res.status(500).json({ message: 'Erro interno.' });
      }

      cliente_id = guestUserId;
      createdGuestUserId = guestUserId;
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .insert([
        {
          cliente_id,
          barbeiro_id: normalizedBarberId,
          servico_id: normalizedServiceId,
          data_hora: requestedDateTime.normalized,
          status: 'pendente',
        },
      ])
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase error creating appointment:', error);

      if (createdGuestUserId) {
        await supabase.from('usuarios').delete().eq('id', createdGuestUserId);
      }

      return res.status(500).json({ message: 'Erro interno.' });
    }

    const appointmentId = data && data[0] ? data[0].id : null;
    res.status(201).json({
      message: 'Agendamento criado!',
      appointmentId,
      isGuestBooking: Boolean(createdGuestUserId),
    });
  } catch (err) {
    console.error(err);

    if (createdGuestUserId) {
      await supabase.from('usuarios').delete().eq('id', createdGuestUserId);
    }

    res.status(500).json({ message: 'Erro interno.' });
  }
};

export const getAppointmentsByDate = async (req, res) => {
  const { barbeiroId, data } = req.params;

  try {
    if (!barbeiroId || !data) {
      return res.status(400).json({ message: 'Parametros obrigatorios faltando.' });
    }

    const normalizedBarbeiroId = parseStrictInteger(barbeiroId);
    if (!normalizedBarbeiroId || !/^\d{4}-\d{2}-\d{2}$/.test(String(data)) || !isValidDateString(String(data))) {
      return res.status(400).json({ message: 'Parametros invalidos.' });
    }

    const { professional, error: professionalError } = await getProfessionalAvailability(normalizedBarbeiroId);

    if (professionalError) {
      console.error('Supabase error getAppointmentsByDate professional:', professionalError);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!professional || professional.ativo === 0) {
      return res.json([]);
    }

    const start = `${data} 00:00:00`;
    const end = `${data} 23:59:59`;

    const { data: rows, error } = await supabase
      .from('agendamentos')
      .select('data_hora, status, servico:servicos(duracao_minutos)')
      .eq('barbeiro_id', normalizedBarbeiroId)
      .gte('data_hora', start)
      .lte('data_hora', end);

    if (error) {
      console.error('Supabase error getAppointmentsByDate:', error);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    const horarios = (rows || []).map((r) => {
      if (!shouldBlockSchedule(r)) {
        return null;
      }

      const parsed = parseDateTimeString(r?.data_hora);

      return {
        horario: parsed ? parsed.time : '00:00:00',
        duracao_minutos: Number(r?.servico?.duracao_minutos) || null,
      };
    }).filter(Boolean);

    res.json(horarios);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno.' });
  }
};

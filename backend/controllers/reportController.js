import supabase from '../config/db.js';
import { isValidDateString, sanitizeSearchTerm } from '../utils/validation.js';

const CANCELED_STATUSES = new Set([
  'cancelado',
  'cancelada',
  'cancelled',
  'recusado',
  'recusada',
  'rejeitado',
  'rejeitada',
]);

const REVENUE_STATUSES = new Set(['confirmado', 'atendido']);

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

const formatDateOnly = (value) => String(value || '').trim().replace('T', ' ').slice(0, 10);

const toYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildPeriodRange = ({ periodo, startDate, endDate }) => {
  const normalizedPeriod = String(periodo || 'mes').trim().toLowerCase();
  const today = new Date();

  const buildRange = (start, end, label) => ({
    value: normalizedPeriod,
    label,
    startDate: start,
    endDate: end,
    startDateTime: `${start} 00:00:00`,
    endDateTime: `${end} 23:59:59`,
  });

  if (normalizedPeriod === 'dia') {
    const day = toYMD(today);
    return buildRange(day, day, 'Dia');
  }

  if (normalizedPeriod === 'semana') {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    return buildRange(toYMD(start), toYMD(today), 'Semana');
  }

  if (normalizedPeriod === 'custom') {
    const start = String(startDate || '').trim();
    const end = String(endDate || '').trim();

    if (!start || !end) {
      return { error: 'Informe data inicial e final para periodo personalizado.' };
    }

    if (!isValidDateString(start) || !isValidDateString(end)) {
      return { error: 'Datas invalidas no periodo personalizado.' };
    }

    if (start > end) {
      return { error: 'A data inicial nao pode ser maior que a data final.' };
    }

    return buildRange(start, end, 'Personalizado');
  }

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return buildRange(toYMD(monthStart), toYMD(monthEnd), 'Mes');
};

const pickServiceExtrema = (serviceCountMap, mode) => {
  const entries = [...serviceCountMap.entries()];
  if (!entries.length) {
    return { name: '-', count: 0 };
  }

  const sorted = entries.sort((a, b) => {
    if (mode === 'max') {
      if (b[1] !== a[1]) return b[1] - a[1];
    } else if (a[1] !== b[1]) {
      return a[1] - b[1];
    }

    return String(a[0]).localeCompare(String(b[0]));
  });

  return {
    name: sorted[0][0],
    count: sorted[0][1],
  };
};

const pickDayExtremaByCount = (dailyMap, mode) => {
  const entries = [...dailyMap.entries()];
  if (!entries.length) {
    return { date: '-', count: 0 };
  }

  const sorted = entries.sort((a, b) => {
    const aCount = a[1].count;
    const bCount = b[1].count;

    if (mode === 'max') {
      if (bCount !== aCount) return bCount - aCount;
    } else if (aCount !== bCount) {
      return aCount - bCount;
    }

    return String(a[0]).localeCompare(String(b[0]));
  });

  return {
    date: sorted[0][0],
    count: sorted[0][1].count,
  };
};

const pickDayExtremaByRevenue = (dailyMap, mode) => {
  const entries = [...dailyMap.entries()];
  if (!entries.length) {
    return { date: '-', revenue: 0 };
  }

  const sorted = entries.sort((a, b) => {
    const aRevenue = Number(a[1].revenue) || 0;
    const bRevenue = Number(b[1].revenue) || 0;

    if (mode === 'max') {
      if (bRevenue !== aRevenue) return bRevenue - aRevenue;
    } else if (aRevenue !== bRevenue) {
      return aRevenue - bRevenue;
    }

    return String(a[0]).localeCompare(String(b[0]));
  });

  return {
    date: sorted[0][0],
    revenue: Number(sorted[0][1].revenue) || 0,
  };
};

export const getProfessionalReport = async (req, res) => {
  const rawProfessional = sanitizeSearchTerm(req.query?.profissional, { maxLength: 80 });
  const periodo = String(req.query?.periodo || 'mes').trim().toLowerCase();
  const startDate = String(req.query?.startDate || '').trim();
  const endDate = String(req.query?.endDate || '').trim();

  if (!rawProfessional) {
    return res.status(400).json({ message: 'Informe nome, e-mail ou ID do profissional.' });
  }

  const periodRange = buildPeriodRange({ periodo, startDate, endDate });
  if (periodRange?.error) {
    return res.status(400).json({ message: periodRange.error });
  }

  try {
    let professionalQuery = supabase
      .from('usuarios')
      .select('id, nome_usuario, email')
      .eq('tipo_usuario', 'barbeiro')
      .limit(1);

    if (/^\d+$/.test(rawProfessional)) {
      professionalQuery = professionalQuery.eq('id', Number(rawProfessional));
    } else {
      const escaped = rawProfessional;
      professionalQuery = professionalQuery.or(`nome_usuario.ilike.%${escaped}%,email.ilike.%${escaped}%`);
    }

    const { data: professionals, error: professionalError } = await professionalQuery;

    if (professionalError) {
      console.error('Supabase error fetching professional report target:', professionalError);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    if (!professionals || professionals.length === 0) {
      return res.status(404).json({ message: 'Profissional nao encontrado.' });
    }

    const professional = professionals[0];

    const { data: appointments, error: appointmentsError } = await supabase
      .from('agendamentos')
      .select('id, data_hora, status, servico:servicos(nome, preco)')
      .eq('barbeiro_id', professional.id)
      .gte('data_hora', periodRange.startDateTime)
      .lte('data_hora', periodRange.endDateTime)
      .order('data_hora', { ascending: true });

    if (appointmentsError) {
      console.error('Supabase error fetching appointments for report:', appointmentsError);
      return res.status(500).json({ message: 'Erro interno.' });
    }

    const serviceCountMap = new Map();
    const dailyMap = new Map();

    let totalAppointments = 0;
    let totalRevenue = 0;

    for (const appointment of appointments || []) {
      const status = normalizeStatus(appointment?.status);
      if (CANCELED_STATUSES.has(status)) {
        continue;
      }

      const serviceName = String(appointment?.servico?.nome || 'Servico nao identificado').trim();
      const servicePrice = Number(appointment?.servico?.preco) || 0;
      const dayKey = formatDateOnly(appointment?.data_hora);

      totalAppointments += 1;
      serviceCountMap.set(serviceName, (serviceCountMap.get(serviceName) || 0) + 1);

      const dayStats = dailyMap.get(dayKey) || { count: 0, revenue: 0 };
      dayStats.count += 1;

      if (REVENUE_STATUSES.has(status)) {
        dayStats.revenue += servicePrice;
        totalRevenue += servicePrice;
      }

      dailyMap.set(dayKey, dayStats);
    }

    const response = {
      professional,
      period: {
        value: periodRange.value,
        label: periodRange.label,
        startDate: periodRange.startDate,
        endDate: periodRange.endDate,
      },
      totals: {
        appointments: totalAppointments,
        revenue: Number(totalRevenue.toFixed(2)),
        activeDays: dailyMap.size,
        trackedServices: serviceCountMap.size,
      },
      ranking: {
        mostUsedService: pickServiceExtrema(serviceCountMap, 'max'),
        leastUsedService: pickServiceExtrema(serviceCountMap, 'min'),
        dayMostServices: pickDayExtremaByCount(dailyMap, 'max'),
        dayLeastServices: pickDayExtremaByCount(dailyMap, 'min'),
        dayMostRevenue: pickDayExtremaByRevenue(dailyMap, 'max'),
        dayLeastRevenue: pickDayExtremaByRevenue(dailyMap, 'min'),
      },
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erro interno.' });
  }
};

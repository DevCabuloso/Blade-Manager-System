const SAO_PAULO_TIMEZONE = 'America/Sao_Paulo';
const DEFAULT_SLOT_MINUTES = Number(process.env.APPOINTMENT_SLOT_MINUTES || 15);
const MIN_SERVICE_DURATION = Number(process.env.MIN_SERVICE_DURATION_MINUTES || 5);
const MAX_SERVICE_DURATION = Number(process.env.MAX_SERVICE_DURATION_MINUTES || 480);

const VALID_WEEK_DAYS = new Set([
  'domingo',
  'segunda',
  'terca',
  'terça',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
  'sábado',
]);

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const normalizeWeekDay = (value) => normalizeText(value);

export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

export const parsePositiveNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseStrictInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export const parseTimeString = (value) => {
  const match = String(value || '').trim().match(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] || '0');

  return {
    hours,
    minutes,
    seconds,
    totalMinutes: hours * 60 + minutes,
    normalized: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    hhmm: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
  };
};

export const isValidDateString = (value) => {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const parseDateTimeString = (value) => {
  const match = String(value || '')
    .trim()
    .replace('T', ' ')
    .match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}(?::\d{2})?)$/);

  if (!match) return null;

  const date = match[1];
  const time = parseTimeString(match[2]);

  if (!isValidDateString(date) || !time) return null;

  return {
    date,
    time: time.normalized,
    timeHHMM: time.hhmm,
    totalMinutes: time.totalMinutes,
    seconds: time.seconds,
    normalized: `${date} ${time.normalized}`,
  };
};

export const getTimeZoneNowParts = (timeZone = SAO_PAULO_TIMEZONE) => {
  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}:${values.second}`,
    normalized: `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second}`,
  };
};

export const isPastDateTimeInSaoPaulo = (normalizedDateTime) => normalizedDateTime < getTimeZoneNowParts().normalized;

export const getWeekDayFromDate = (dateString) => {
  if (!isValidDateString(dateString)) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  const weekdays = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  return weekdays[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
};

export const isAlignedToSlot = (timeInput, slotMinutes = DEFAULT_SLOT_MINUTES) => {
  const parsed = typeof timeInput === 'string' ? parseTimeString(timeInput) : timeInput;
  if (!parsed) return false;
  if (!Number.isInteger(slotMinutes) || slotMinutes <= 0) return true;
  return parsed.seconds === 0 && parsed.totalMinutes % slotMinutes === 0;
};

export const rangesOverlap = (startA, endA, startB, endB) => startA < endB && endA > startB;

export const validateServicePayload = ({ nome, preco, duracao_minutos }) => {
  const parsedPrice = parsePositiveNumber(preco);
  const parsedDuration = parseStrictInteger(duracao_minutos);

  if (!isNonEmptyString(nome)) {
    return { ok: false, message: 'Nome do servico e obrigatorio.' };
  }

  if (!(parsedPrice > 0)) {
    return { ok: false, message: 'Preco deve ser maior que zero.' };
  }

  if (
    !Number.isInteger(parsedDuration) ||
    parsedDuration < MIN_SERVICE_DURATION ||
    parsedDuration > MAX_SERVICE_DURATION
  ) {
    return {
      ok: false,
      message: `Duracao deve estar entre ${MIN_SERVICE_DURATION} e ${MAX_SERVICE_DURATION} minutos.`,
    };
  }

  return {
    ok: true,
    value: {
      nome: String(nome).trim(),
      preco: parsedPrice,
      duracao_minutos: parsedDuration,
    },
  };
};

export const validateHorarioPayload = ({ dia_semana, hora_abertura, hora_fechamento }) => {
  const normalizedDay = normalizeWeekDay(dia_semana);
  const opening = parseTimeString(hora_abertura);
  const closing = parseTimeString(hora_fechamento);

  if (!VALID_WEEK_DAYS.has(String(dia_semana || '').trim().toLowerCase()) && !VALID_WEEK_DAYS.has(normalizedDay)) {
    return { ok: false, message: 'Dia da semana invalido.' };
  }

  if (!opening || !closing) {
    return { ok: false, message: 'Formato de hora invalido. Use HH:MM.' };
  }

  if (closing.totalMinutes <= opening.totalMinutes) {
    return { ok: false, message: 'Hora de fechamento deve ser maior que a de abertura.' };
  }

  return {
    ok: true,
    value: {
      dia_semana: normalizedDay,
      hora_abertura: opening.hhmm,
      hora_fechamento: closing.hhmm,
    },
  };
};

export const getSlotMinutes = () => {
  if (!Number.isInteger(DEFAULT_SLOT_MINUTES) || DEFAULT_SLOT_MINUTES <= 0) {
    return 15;
  }
  return DEFAULT_SLOT_MINUTES;
};

export const getDurationLimits = () => ({
  min: MIN_SERVICE_DURATION,
  max: MAX_SERVICE_DURATION,
});

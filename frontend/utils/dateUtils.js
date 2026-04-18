export const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Marco',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const weekDaysShort = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const weekDaysFull = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

export const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const getDaysInMonth = (year, month) =>
  Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, index) => index + 1);

export const getMonthLeadingBlanks = (year, month) =>
  Array.from({ length: new Date(year, month, 1).getDay() }, (_, index) => index + 1);

export const formatDisplayDate = (day, month, year) => {
  if (!day) return '';

  return `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
};

export const buildAppointmentDateTime = (day, month, year, time) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')} ${time}:00`;

export const toMinutes = (timeStr) => {
  const [hours = 0, minutes = 0] = String(timeStr || '')
    .split(':')
    .map((part) => Number(part));

  return hours * 60 + minutes;
};

export const toHHMM = (totalMinutes) => {
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const mm = String(totalMinutes % 60).padStart(2, '0');

  return `${hh}:${mm}`;
};

export const generateTimes = (horaInicio, horaFim, stepMinutes = 15) => {
  const times = [];
  const start = toMinutes(horaInicio);
  const end = toMinutes(horaFim);

  for (let minute = start; minute <= end; minute += stepMinutes) {
    times.push(toHHMM(minute));
  }

  return times;
};

export const getWeekDayKey = (year, month, day) => {
  const date = new Date(year, month, day);
  return weekDaysFull[date.getDay()];
};

export const isPastDate = (day, month, year) => {
  const selected = new Date(year, month, day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return selected < now;
};

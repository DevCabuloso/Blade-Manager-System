import supabase from '../config/db.js';
import { normalizeWeekDay } from './validation.js';

export const normalizeUserId = (value) => {
  const normalizedId = Number(value);
  return Number.isInteger(normalizedId) ? normalizedId : null;
};

export const isUserInactive = (value) => value === 0 || value === '0' || value === false;

export const getUserById = async (userId, columns = '*') => {
  const normalizedId = normalizeUserId(userId);
  if (normalizedId === null) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase
    .from('usuarios')
    .select(columns)
    .eq('id', normalizedId)
    .limit(1);

  return {
    data: data && data[0] ? data[0] : null,
    error,
  };
};

export const getProfessionalAvailability = async (professionalId) => {
  const normalizedProfessionalId = normalizeUserId(professionalId);
  if (normalizedProfessionalId === null) {
    return { professional: null, horarios: [], error: null };
  }

  const { data: professional, error: professionalError } = await getUserById(
    normalizedProfessionalId
  );

  if (professionalError) {
    return { professional: null, horarios: [], error: professionalError };
  }

  if (!professional || professional.tipo_usuario !== 'barbeiro') {
    return { professional: null, horarios: [], error: null };
  }

  if (isUserInactive(professional.ativo)) {
    return { professional, horarios: [], error: null };
  }

  const { data: horarios, error: horariosError } = await supabase
    .from('horarios')
    .select('*')
    .eq('usuarios_id', normalizedProfessionalId)
    .order('id', { ascending: true });

  return {
    professional,
    horarios: (horarios || []).map((horario) => ({
      ...horario,
      dia_semana: normalizeWeekDay(horario?.dia_semana),
    })),
    error: horariosError,
  };
};

import supabase from '../config/db.js';
import { normalizeWeekDay } from './validation.js';

export const getUserById = async (userId, columns = 'id, nome_usuario, email, telefone, tipo_usuario, ativo') => {
  const normalizedId = Number(userId);
  if (!Number.isInteger(normalizedId)) {
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
  const { data: professional, error: professionalError } = await getUserById(
    professionalId,
    'id, nome_usuario, telefone, tipo_usuario, ativo'
  );

  if (professionalError) {
    return { professional: null, horarios: [], error: professionalError };
  }

  if (!professional || professional.tipo_usuario !== 'barbeiro') {
    return { professional: null, horarios: [], error: null };
  }

  if (professional.ativo === 0) {
    return { professional, horarios: [], error: null };
  }

  const { data: horarios, error: horariosError } = await supabase
    .from('horarios')
    .select('*')
    .eq('usuarios_id', Number(professionalId))
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

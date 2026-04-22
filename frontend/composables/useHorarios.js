import { computed, ref } from 'vue';
import axios from 'axios';
import { clearClientAuthState, getSessionAuthState } from '@/services/authService.js';

const DIAS_ORDENADOS = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

export const useHorarios = ({ router }) => {
  const horarios = ref([]);
  const loading = ref(true);
  const errorMessage = ref('');

  const horariosSorted = computed(() =>
    [...horarios.value].sort(
      (a, b) => DIAS_ORDENADOS.indexOf(a.dia_semana) - DIAS_ORDENADOS.indexOf(b.dia_semana),
    ),
  );

  const redirectToLogin = () => {
    clearClientAuthState();
    router.push('/login');
  };

  const withToken = () => {
    const { token } = getSessionAuthState();

    if (!token) {
      redirectToLogin();
      return null;
    }

    return token;
  };

  const fetchHorarios = async () => {
    const token = withToken();

    loading.value = true;
    errorMessage.value = '';

    if (!token) {
      loading.value = false;
      return;
    }

    try {
      const response = await axios.get('/api/horarios/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const rows = Array.isArray(response.data) ? response.data : [];
      horarios.value = rows.filter(
        (item) => item && item.dia_semana && item.hora_abertura && item.hora_fechamento,
      );
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      errorMessage.value = 'Erro ao carregar horários. Tente novamente.';

      if (error.response?.status === 401) {
        redirectToLogin();
      }
    } finally {
      loading.value = false;
    }
  };

  const saveHorario = async ({ id, data }) => {
    const token = withToken();
    if (!token) return false;

    errorMessage.value = '';

    try {
      let savedHorario = null;

      if (id) {
        const response = await axios.put(`/api/horarios/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        savedHorario = response.data;
      } else {
        const response = await axios.post('/api/horarios', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        savedHorario = response.data;
      }

      if (savedHorario?.id) {
        const nextHorarios = [...horarios.value];
        const existingIndex = nextHorarios.findIndex((item) => Number(item.id) === Number(savedHorario.id));

        if (existingIndex >= 0) {
          nextHorarios.splice(existingIndex, 1, savedHorario);
        } else {
          nextHorarios.push(savedHorario);
        }

        horarios.value = nextHorarios;
      } else {
        await fetchHorarios();
      }
      return true;
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      errorMessage.value = error.response?.data?.message || 'Erro ao salvar horário.';
      return false;
    }
  };

  const deleteHorario = async (id) => {
    const token = withToken();
    if (!token) return false;

    errorMessage.value = '';

    try {
      await axios.delete(`/api/horarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      horarios.value = horarios.value.filter((item) => Number(item.id) !== Number(id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar horário:', error);
      errorMessage.value = error.response?.data?.message || 'Erro ao deletar horário.';
      return false;
    }
  };

  return {
    horarios,
    horariosSorted,
    loading,
    errorMessage,
    fetchHorarios,
    saveHorario,
    deleteHorario,
  };
};

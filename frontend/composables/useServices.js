import { ref } from 'vue';
import axios from 'axios';
import { clearClientAuthState, getSessionAuthState } from '@/services/authService.js';
import { notifyError, notifySuccess } from '@/utils/feedback.js';

const getUnauthorizedMessage = (fallbackMessage, responseMessage) => responseMessage || fallbackMessage;

export const useServices = ({ router }) => {
  const services = ref([]);
  const isLoading = ref(true);

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

  const handleProtectedRequestError = (error, fallbackMessage) => {
    const status = error.response?.status;
    const message = getUnauthorizedMessage(fallbackMessage, error.response?.data?.message);

    if (status === 401) {
      redirectToLogin();
      return;
    }

    notifyError(message);

    if (status === 403) {
      router.push('/');
    }
  };

  const fetchServices = async () => {
    const token = withToken();

    if (!token) {
      isLoading.value = false;
      return;
    }

    isLoading.value = true;

    try {
      const response = await axios.get('/api/servicos/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      services.value = Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Erro ao carregar servicos:', error.response?.status, error.response?.data || error.message);
      handleProtectedRequestError(error, 'Erro ao carregar servicos.');
    } finally {
      isLoading.value = false;
    }
  };

  const createService = async (payload) => {
    const token = withToken();
    if (!token) return false;

    try {
      const response = await axios.post(
        '/api/servicos',
        {
          nome: payload.name,
          preco: payload.price,
          duracao_minutos: payload.duration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data?.service?.id) {
        services.value = [...services.value, response.data.service];
      } else {
        await fetchServices();
      }

      notifySuccess('Servico criado!');
      return true;
    } catch (error) {
      console.error('Erro ao criar servico:', error.response?.data || error.message);
      handleProtectedRequestError(error, 'Erro ao criar servico.');
      return false;
    }
  };

  const updateService = async (serviceId, payload) => {
    const token = withToken();
    if (!token) return false;

    try {
      const response = await axios.put(
        `/api/servicos/${serviceId}`,
        {
          nome: payload.name,
          preco: payload.price,
          duracao_minutos: payload.duration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data?.service?.id) {
        services.value = services.value.map((service) =>
          Number(service.id) === Number(serviceId) ? response.data.service : service,
        );
      } else {
        await fetchServices();
      }

      notifySuccess('Servico atualizado!');
      return true;
    } catch (error) {
      console.error('Erro ao atualizar servico:', error.response?.data || error.message);
      handleProtectedRequestError(error, 'Erro ao atualizar servico.');
      return false;
    }
  };

  const deleteService = async (serviceId) => {
    const token = withToken();
    if (!token) return false;

    try {
      await axios.delete(`/api/servicos/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      services.value = services.value.filter((service) => Number(service.id) !== Number(serviceId));
      notifySuccess('Servico excluido!');
      return true;
    } catch (error) {
      console.error('Erro ao excluir servico:', error.response?.data || error.message);
      handleProtectedRequestError(error, 'Erro ao excluir servico.');
      return false;
    }
  };

  return {
    services,
    isLoading,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
};

import axios from 'axios';

export const fetchServicesByProfessional = async (profissionalId) => {
  const response = await axios.get(`/api/servicos/${profissionalId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchWorkingHoursByProfessional = async (profissionalId) => {
  const response = await axios.get(`/api/horarios/${profissionalId}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchOccupiedAppointments = async (profissionalId, formattedDate) => {
  const response = await axios.get(`/api/agendamentos/${profissionalId}/${formattedDate}`);
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchProfessionalById = async (profissionalId, token) => {
  const response = await axios.get(`/api/usuarios/${profissionalId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

export const createAppointment = async (appointmentData, token) => {
  const response = await axios.post('/api/agendamentos', appointmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

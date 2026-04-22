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
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;
  const response = await axios.get(`/api/usuarios/${profissionalId}`, config);

  return response.data;
};

export const createAppointment = async (appointmentData, token) => {
  const config = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined;
  const response = await axios.post('/api/agendamentos', appointmentData, config);

  return response.data;
};

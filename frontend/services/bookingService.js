import axios from 'axios';

const BOOKING_BOOTSTRAP_TTL_MS = 60 * 1000;
const bookingBootstrapCache = new Map();
const bookingBootstrapRequests = new Map();

export const fetchBookingBootstrap = async (profissionalId) => {
  const cacheKey = String(profissionalId || '');
  const cached = bookingBootstrapCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const inFlightRequest = bookingBootstrapRequests.get(cacheKey);
  if (inFlightRequest) {
    return inFlightRequest;
  }

  const request = axios.get(`/api/agendamentos/bootstrap/${profissionalId}`)
    .then((response) => {
      const payload = response?.data || {};
      const normalized = {
        professional: payload?.professional || null,
        services: Array.isArray(payload?.services) ? payload.services : [],
        workingHours: Array.isArray(payload?.workingHours) ? payload.workingHours : [],
      };

      bookingBootstrapCache.set(cacheKey, {
        value: normalized,
        expiresAt: now + BOOKING_BOOTSTRAP_TTL_MS,
      });

      return normalized;
    })
    .finally(() => {
      bookingBootstrapRequests.delete(cacheKey);
    });

  bookingBootstrapRequests.set(cacheKey, request);

  return request;
};

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

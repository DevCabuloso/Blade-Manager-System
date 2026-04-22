<template>
  <LayoutProfissional>
    <div class="app-shell dashboard-shell">
      <div class="page-wrap dashboard-stack">
        <AppPanel title="Dashboard" subtitle="Acompanhe seus agendamentos e ganhos." />

        <v-alert v-if="errorMessage" type="error" variant="tonal" rounded="xl">
          {{ errorMessage }}
        </v-alert>

        <AppPanel>
          <v-row dense>
            <v-col cols="12" md="4">
              <AppField v-model="startDate" type="date" label="Data Inicial" />
            </v-col>

            <v-col cols="12" md="4">
              <AppField v-model="endDate" type="date" label="Data Final" />
            </v-col>

            <v-col cols="12" md="4">
              <div class="dashboard-filter-actions">
                <AppButton block @click="fetchFilteredAppointments">
                  Filtrar
                </AppButton>
                <AppButton variant="secondary" block @click="resetFilter">
                  Limpar
                </AppButton>
              </div>
            </v-col>
          </v-row>
        </AppPanel>

        <v-row dense>
          <v-col cols="12" md="4">
            <v-card rounded="xl" border color="rgba(3, 7, 18, 0.82)" class="dashboard-stat-card">
              <v-card-text class="text-center">
                <p class="dashboard-stat-label">Total de Horários</p>
                <p class="dashboard-stat-value dashboard-stat-value--primary">{{ summary.total }}</p>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="xl" border color="rgba(3, 7, 18, 0.82)" class="dashboard-stat-card">
              <v-card-text class="text-center">
                <p class="dashboard-stat-label dashboard-stat-label--warning">Pendentes</p>
                <p class="dashboard-stat-value dashboard-stat-value--warning">{{ summary.pending }}</p>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card rounded="xl" border color="rgba(3, 7, 18, 0.82)" class="dashboard-stat-card">
              <v-card-text class="text-center">
                <p class="dashboard-stat-label dashboard-stat-label--success">Atendidos</p>
                <p class="dashboard-stat-value dashboard-stat-value--success">{{ summary.attended }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <AppPanel title="Faturamento Total">
          <p class="dashboard-revenue">R$ {{ summary.revenue.toFixed(2) }}</p>
        </AppPanel>

        <AppPanel title="Agendamentos Filtrados">
          <AppEmptyState
            v-if="sortedAppointments.length === 0"
            title="Nenhum agendamento encontrado"
            message="Ajuste o período para visualizar novos resultados."
          />

          <div v-else class="dashboard-cards-grid">
            <v-card
              v-for="appointment in sortedAppointments"
              :key="appointment.id"
              rounded="xl"
              border
              color="rgba(15, 23, 42, 0.62)"
              class="dashboard-appointment-card"
            >
              <v-card-text class="dashboard-appointment-card__body">
                <div class="dashboard-appointment-card__header">
                  <div>
                    <p class="dashboard-appointment-card__label">Cliente</p>
                    <p class="dashboard-appointment-card__value">{{ appointment.customerName || 'Cliente' }}</p>
                  </div>

                  <span class="dashboard-status" :class="statusClass(getStatus(appointment))">
                    {{ getStatus(appointment) }}
                  </span>
                </div>

                <div class="dashboard-appointment-card__meta">
                  <div class="dashboard-appointment-card__row">
                    <p class="dashboard-appointment-card__label">Serviço</p>
                    <p class="dashboard-appointment-card__value dashboard-appointment-card__value--inline">{{ appointment.service || 'Não especificado' }}</p>
                  </div>

                  <div class="dashboard-appointment-card__row">
                    <p class="dashboard-appointment-card__label">Horário</p>
                    <p class="dashboard-appointment-card__value dashboard-appointment-card__value--inline">{{ formatDateTime(appointment.time) }}</p>
                  </div>

                  <div class="dashboard-appointment-card__row">
                    <p class="dashboard-appointment-card__label">Valor</p>
                    <p class="dashboard-appointment-card__value dashboard-appointment-card__value--inline">R$ {{ Number(appointment.value || 0).toFixed(2) }}</p>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </AppPanel>
      </div>
    </div>
  </LayoutProfissional>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import LayoutProfissional from '@/components/LayoutProfissional.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppEmptyState from '@/components/ui/AppEmptyState.vue';
import AppField from '@/components/ui/AppField.vue';
import AppPanel from '@/components/ui/AppPanel.vue';

const today = new Date().toISOString().split('T')[0];
const startDate = ref(today);
const endDate = ref(today);
const appointments = ref([]);
const errorMessage = ref('');

const normalizeAppointmentStatus = (value) => String(value || '').trim().toLowerCase();

const parseAppointmentDate = (value) => {
  if (!value) return null;

  const normalizedValue = String(value).trim().replace(' ', 'T');
  const parsed = new Date(normalizedValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed; 
};

const getStatus = (appointment) => {
  const normalizedStatus = normalizeAppointmentStatus(appointment?.status);
  const parsedDate = parseAppointmentDate(appointment?.time);
  const hasStarted = parsedDate ? parsedDate.getTime() <= Date.now() : false;

  if (normalizedStatus === 'cancelado') {
    return 'Cancelado';
  }

  if (hasStarted) {
    return 'Atendido';
  }

  switch (normalizedStatus) {
    case 'pendente':
      return 'Pendente';
    case 'confirmado':
      return 'Confirmado';
    case 'atendido':
      return 'Atendido';
    default: {
      if (!parsedDate) return 'Desconhecido';
      return 'Pendente';
    }
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'Data inválida';

  const date = parseAppointmentDate(dateStr);
  if (!date) return 'Data inválida';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
};

const statusClass = (status) => ({
  'dashboard-status--success': status === 'Atendido' || status === 'Confirmado',
  'dashboard-status--warning': status === 'Pendente',
  'dashboard-status--danger': status === 'Cancelado',
  'dashboard-status--muted': status === 'Desconhecido',
});

const sortedAppointments = computed(() =>
  [...appointments.value]
    .filter((appt) => parseAppointmentDate(appt.time))
    .sort((a, b) => parseAppointmentDate(a.time) - parseAppointmentDate(b.time))
);

const summary = computed(() =>
  sortedAppointments.value.reduce(
    (acc, appointment) => {
      const status = getStatus(appointment);
      const value = Number(appointment.value) || 0;

      acc.total += 1;
      if (status === 'Pendente') acc.pending += 1;
      if (status === 'Atendido' || status === 'Confirmado') {
        acc.attended += 1;
        acc.revenue += value;
      }

      return acc;
    },
    { total: 0, pending: 0, attended: 0, revenue: 0 }
  )
);

const fetchFilteredAppointments = async () => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      errorMessage.value = 'Por favor, faça login novamente.';
      return;
    }

    if (startDate.value > endDate.value) {
      errorMessage.value = 'A data inicial não pode ser maior que a data final.';
      appointments.value = [];
      return;
    }

    const response = await axios.get('/api/agendamentos/me', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      },
    });

    const rows = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
        ? response.data.data
        : null;

    if (!rows) {
      throw new Error('Dados retornados não são um array');
    }

    appointments.value = rows;
    errorMessage.value = '';
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);

    if (error.response?.status === 401 || error.response?.status === 403) {
      errorMessage.value = 'Sua sessão expirou ou a conta não tem mais acesso. Faça login novamente.';
      appointments.value = [];
      return;
    }

    errorMessage.value = error.response?.data?.message || 'Erro ao carregar agendamentos. Tente novamente.';
    appointments.value = [];
  }
};

const resetFilter = () => {
  startDate.value = today;
  endDate.value = today;
  fetchFilteredAppointments();
};

onMounted(fetchFilteredAppointments);
</script>

<style scoped>
.dashboard-shell {
  padding: 1.5rem 1rem 2rem;
}

.dashboard-stack {
  display: grid;
  gap: 1.5rem;
}

.dashboard-filter-actions {
  display: grid;
  gap: 0.75rem;
}

.dashboard-stat-card {
  border-color: rgba(148, 163, 184, 0.14) !important;
}

.dashboard-stat-label {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.dashboard-stat-label--warning,
.dashboard-stat-value--warning {
  color: #facc15;
}

.dashboard-stat-label--success,
.dashboard-stat-value--success {
  color: #4ade80;
}

.dashboard-stat-value {
  margin: 0.4rem 0 0;
  font-size: 2rem;
  font-weight: 900;
}

.dashboard-stat-value--primary {
  color: #c084fc;
}

.dashboard-revenue {
  margin: 0;
  color: #d8b4fe;
  font-size: clamp(2rem, 3vw, 2.7rem);
  font-weight: 900;
}

.dashboard-cards-grid {
  display: grid;
  gap: 0.55rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.dashboard-appointment-card {
  border-color: rgba(148, 163, 184, 0.14) !important;
}

.dashboard-appointment-card__body {
  display: grid;
  gap: 0.5rem;
  padding: 0.7rem !important;
}

.dashboard-appointment-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.dashboard-appointment-card__meta {
  display: grid;
  gap: 0.38rem;
  grid-template-columns: 1fr;
}

.dashboard-appointment-card__row {
  min-width: 0;
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 0.5rem;
  align-items: baseline;
}

.dashboard-appointment-card__label {
  margin: 0;
  color: #94a3b8;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.dashboard-appointment-card__value {
  margin: 0.2rem 0 0;
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 700;
  word-break: break-word;
}

.dashboard-appointment-card__value--inline {
  margin-top: 0;
}

.dashboard-status {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  border: 1px solid transparent;
}

.dashboard-status--success {
  color: #4ade80;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(74, 222, 128, 0.25);
}

.dashboard-status--warning {
  color: #facc15;
  background: rgba(250, 204, 21, 0.12);
  border-color: rgba(250, 204, 21, 0.24);
}

.dashboard-status--danger {
  color: #f87171;
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.22);
}

.dashboard-status--muted {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.12);
  border-color: rgba(148, 163, 184, 0.18);
}

@media (min-width: 960px) {
  .dashboard-filter-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-self: end;
  }
}

@media (max-width: 599px) {
  .dashboard-cards-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .dashboard-appointment-card__row {
    grid-template-columns: 66px minmax(0, 1fr);
  }
}
</style>

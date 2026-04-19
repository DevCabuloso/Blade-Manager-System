<template>
  <LayoutProfissional>
    <div class="app-shell agenda-shell">
      <div class="page-wrap agenda-stack">
        <AppPanel
          class="agenda-summary-panel"
          :title="`Agenda - ${formatMonth(selectedMonth)}`"
          subtitle="Visualize os agendamentos do mes selecionado."
        />

        <AppPanel class="agenda-filter-panel">
          <div class="agenda-filter-bar">
            <div class="agenda-month-controls">
              <v-btn
                v-if="isMobile"
                icon="mdi-chevron-left"
                size="small"
                variant="flat"
                color="primary"
                class="agenda-month-nav"
                @click="previousMonth"
              />
              <AppButton v-else variant="secondary" size="small" class="agenda-nav-button" @click="previousMonth">
                &lt;
              </AppButton>

              <div class="agenda-month-selects">
                <AppField
                  v-model="selectedMonthNumber"
                  field-type="select"
                  label="Mes"
                  density="compact"
                  hide-details
                  :items="monthOptions"
                  item-title="label"
                  item-value="value"
                  class="agenda-month-field agenda-month-field--month"
                  @update:model-value="handleMonthSelection"
                />

                <AppField
                  v-model="selectedYearNumber"
                  field-type="select"
                  label="Ano"
                  density="compact"
                  hide-details
                  :items="yearOptions"
                  item-title="label"
                  item-value="value"
                  class="agenda-month-field agenda-month-field--year"
                  @update:model-value="handleMonthSelection"
                />
              </div>

              <v-btn
                v-if="isMobile"
                icon="mdi-chevron-right"
                size="small"
                variant="flat"
                color="primary"
                class="agenda-month-nav"
                @click="nextMonth"
              />
              <AppButton v-else variant="secondary" size="small" class="agenda-nav-button" @click="nextMonth">
                &gt;
              </AppButton>
            </div>

            <AppButton
              v-if="!isCurrentMonthSelected"
              size="small"
              class="agenda-current-button"
              @click="resetFilter"
            >
              Mes Atual
            </AppButton>
          </div>
        </AppPanel>

        <AppPanel class="agenda-calendar-panel" title="Calendario de Agendamentos">
          <div class="agenda-calendar-grid">
            <div v-for="day in weekLabels" :key="day" class="agenda-weekday">
              {{ day }}
            </div>

            <button
              v-for="day in calendarDays"
              :key="day.date"
              class="agenda-day"
              :class="agendaDayClass(day)"
              :title="dayTitle(day)"
              :aria-label="dayTitle(day)"
              @click="selectDay(day)"
            >
              <span class="agenda-day__number" :class="{ 'agenda-day__number--today': day.isToday }">
                {{ day.day }}
              </span>
              <span v-if="day.appointmentCount && !isMobile" class="agenda-day__count">
                {{ day.appointmentCount }}
              </span>
              <span v-if="day.hasAppointment" class="agenda-day__indicator"></span>
            </button>
          </div>
        </AppPanel>

        <div
          v-if="selectedDay && selectedDayAppointments.length"
          ref="appointmentsSectionRef"
          class="agenda-appointments-section"
        >
          <AppPanel :title="`Agendamentos - ${formatSelectedDay(selectedDay.date)}`">
            <template #actions>
              <AppButton variant="secondary" @click="selectedDay = null">
                Fechar
              </AppButton>
            </template>

            <v-table theme="dark" class="agenda-table">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Horário</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="appointment in selectedDayAppointments" :key="appointment.id">
                  <td>{{ appointment.service }}</td>
                  <td>{{ formatDateTime(appointment.time) }}</td>
                  <td>R$ {{ appointment.value.toFixed(2) }}</td>
                  <td>
                    <span class="agenda-status" :class="appointment.status === 'Confirmado' ? 'agenda-status--success' : 'agenda-status--warning'">
                      {{ appointment.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </AppPanel>
        </div>
      </div>
    </div>
  </LayoutProfissional>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import axios from 'axios';
import LayoutProfissional from '@/components/LayoutProfissional.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppField from '@/components/ui/AppField.vue';
import AppPanel from '@/components/ui/AppPanel.vue';
import { notifyError } from '@/utils/feedback.js';

const router = useRouter();
const { smAndDown } = useDisplay();
const isMobile = smAndDown;
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const selectedMonthNumber = ref('');
const selectedYearNumber = ref('');
const selectedDay = ref(null);
const appointments = ref([]);
const appointmentsSectionRef = ref(null);

const monthOptions = [
  { label: 'Janeiro', value: '01' },
  { label: 'Fevereiro', value: '02' },
  { label: 'Marco', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Maio', value: '05' },
  { label: 'Junho', value: '06' },
  { label: 'Julho', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Setembro', value: '09' },
  { label: 'Outubro', value: '10' },
  { label: 'Novembro', value: '11' },
  { label: 'Dezembro', value: '12' },
];

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 9 }, (_, index) => {
    const year = String(currentYear - 4 + index);
    return { label: year, value: year };
  });
});

const weekLabels = computed(() => (isMobile.value
  ? ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
  : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']));

const isCurrentMonthSelected = computed(() => selectedMonth.value === new Date().toISOString().slice(0, 7));

const appointmentsByDate = computed(() => appointments.value.reduce((accumulator, appointment) => {
  const date = appointment.time.split('T')[0];
  accumulator[date] = (accumulator[date] || 0) + 1;
  return accumulator;
}, {}));

const selectedDayAppointments = computed(() => {
  if (!selectedDay.value) return [];

  return appointments.value
    .filter((appt) => appt.time.split('T')[0] === selectedDay.value.date)
    .sort((a, b) => new Date(a.time) - new Date(b.time));
});

const calendarDays = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const today = new Date().toISOString().split('T')[0];
  const days = [];
  const leadingDays = firstDay.getDay();

  for (let i = leadingDays - 1; i >= 0; i -= 1) {
    const prevDate = new Date(year, month - 1, -i);
    days.push({
      date: prevDate.toISOString().split('T')[0],
      day: prevDate.getDate(),
      isCurrentMonth: false,
      hasAppointment: false,
      appointmentCount: 0,
      isToday: false,
    });
  }

  for (let i = 1; i <= lastDay.getDate(); i += 1) {
    const date = new Date(year, month - 1, i).toISOString().split('T')[0];
    const appointmentCount = appointmentsByDate.value[date] || 0;
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      hasAppointment: appointmentCount > 0,
      appointmentCount,
      isToday: date === today,
    });
  }

  const trailingDays = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= trailingDays; i += 1) {
    const nextDate = new Date(year, month, i);
    days.push({
      date: nextDate.toISOString().split('T')[0],
      day: nextDate.getDate(),
      isCurrentMonth: false,
      hasAppointment: false,
      appointmentCount: 0,
      isToday: false,
    });
  }

  return days;
});

const formatMonth = (month) => {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 1);
  return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (char) => char.toUpperCase());
};

const formatSelectedDay = (date) => {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
};

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const selectDay = (day) => {
  selectedDay.value = day;
};

const dayTitle = (day) => {
  const baseLabel = formatSelectedDay(day.date);

  if (!day.isCurrentMonth) {
    return `${baseLabel} - fora do mes atual`;
  }

  if (!day.appointmentCount) {
    return `${baseLabel} - sem agendamentos`;
  }

  return `${baseLabel} - ${day.appointmentCount} ${day.appointmentCount === 1 ? 'agendamento' : 'agendamentos'}`;
};

watch(selectedDayAppointments, async (items) => {
  if (!selectedDay.value || !items.length) return;

  await nextTick();
  appointmentsSectionRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
});

const agendaDayClass = (day) => ({
  'agenda-day--current': day.isCurrentMonth,
  'agenda-day--outside': !day.isCurrentMonth,
  'agenda-day--selected': selectedDay.value && day.date === selectedDay.value.date,
  'agenda-day--appointment': day.hasAppointment,
});

const syncMonthSelectors = () => {
  const [year, month] = selectedMonth.value.split('-');
  selectedMonthNumber.value = month;
  selectedYearNumber.value = year;
};

const handleMonthSelection = () => {
  if (!selectedMonthNumber.value || !selectedYearNumber.value) {
    return;
  }

  const normalized = `${selectedYearNumber.value}-${selectedMonthNumber.value}`;

  if (normalized === selectedMonth.value) {
    return;
  }

  selectedMonth.value = normalized;
  selectedDay.value = null;
  fetchAppointments();
};

const fetchAppointments = async () => {
  try {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) {
      router.push('/');
      return;
    }

    const response = await axios.get('/api/agendamentos/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const rows = Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.data)
        ? response.data.data
        : [];

    appointments.value = rows.map((appointment) => ({
      ...appointment,
      value: Number(appointment.value) || 0,
    }));

    if (selectedDay.value && !appointments.value.some((appt) => appt.time.split('T')[0] === selectedDay.value.date)) {
      selectedDay.value = null;
    }
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);

    if (error.response?.status === 403) {
      sessionStorage.clear();
      localStorage.removeItem('blade_persistent_auth');
      notifyError('Sua conta precisa de validacao de e-mail. Faca login novamente para reenviar o link.');
      router.push('/login');
    }
  }
};

const previousMonth = () => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const newDate = new Date(year, month - 2, 1);
  selectedMonth.value = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
  syncMonthSelectors();
  fetchAppointments();
};

const nextMonth = () => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const newDate = new Date(year, month, 1);
  selectedMonth.value = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
  syncMonthSelectors();
  fetchAppointments();
};

const resetFilter = () => {
  selectedMonth.value = new Date().toISOString().slice(0, 7);
  syncMonthSelectors();
  selectedDay.value = null;
  fetchAppointments();
};

onMounted(() => {
  syncMonthSelectors();
  fetchAppointments();
});
</script>

<style scoped>
.agenda-shell {
  padding: 1.5rem 1rem 2rem;
}

.agenda-stack {
  display: grid;
  gap: 1.5rem;
}

.agenda-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.agenda-month-controls {
  display: grid;
  grid-template-columns: auto minmax(250px, 360px) auto;
  gap: 0.75rem;
  align-items: stretch;
  min-height: 3rem;
}

.agenda-month-selects {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 0.6rem;
  min-width: 0;
}

.agenda-month-nav {
  min-width: 2.8rem;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 0.95rem;
  box-shadow: 0 12px 24px rgba(88, 28, 135, 0.2);
}

.agenda-month-field {
  min-width: 0;
}

.agenda-month-field--month {
  max-width: 210px;
}

.agenda-month-field--year {
  max-width: 140px;
}

.agenda-month-field :deep(.v-field) {
  height: 100%;
  min-height: 3rem;
}

.agenda-nav-button,
.agenda-current-button {
  height: 3rem !important;
  min-height: 3rem !important;
  align-self: stretch;
}

.agenda-month-field :deep(.v-field__input),
.agenda-month-field :deep(input) {
  font-size: 0.96rem;
  font-weight: 700;
}

.agenda-current-button {
  width: 100%;
}

.agenda-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.4rem;
}

.agenda-weekday {
  padding: 0.75rem 0.2rem;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-align: center;
  text-transform: uppercase;
}

.agenda-day {
  position: relative;
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: rgba(148, 163, 184, 0.08);
  background: rgba(15, 23, 42, 0.52);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 0.95rem;
  color: #e2e8f0;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.agenda-day:hover {
  background: rgba(168, 85, 247, 0.14);
  border-color: rgba(168, 85, 247, 0.25);
  transform: translateY(-1px);
}

.agenda-day--outside {
  background: rgba(15, 23, 42, 0.38);
  color: #64748b;
}

.agenda-day--appointment {
  border-color: rgba(168, 85, 247, 0.34);
}

.agenda-day--selected {
  background: linear-gradient(135deg, #a855f7, #9333ea);
  border-color: rgba(251, 146, 60, 0.6);
  color: #fff7ed;
  box-shadow: 0 14px 28px rgba(147, 51, 234, 0.22);
}

.agenda-day__number {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 800;
}

.agenda-day__number--today {
  background: rgba(255, 255, 255, 0.14);
}

.agenda-day__indicator {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 999px;
  background: #c084fc;
}

.agenda-day__count {
  position: absolute;
  left: 0.42rem;
  bottom: 0.38rem;
  min-width: 1.3rem;
  height: 1.3rem;
  padding: 0 0.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(168, 85, 247, 0.18);
  color: #e9d5ff;
  font-size: 0.72rem;
  font-weight: 800;
}

.agenda-table :deep(table) {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 1rem;
}

.agenda-table :deep(th) {
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 700;
}

.agenda-table :deep(td) {
  color: #e2e8f0;
}

.agenda-status {
  font-weight: 700;
}

.agenda-status--success {
  color: #4ade80;
}

.agenda-status--warning {
  color: #facc15;
}

@media (max-width: 599px) {
  .agenda-shell {
    padding: 1rem 0.75rem 1.5rem;
  }

  .agenda-stack {
    gap: 1rem;
  }

  .agenda-summary-panel,
  .agenda-filter-panel,
  .agenda-calendar-panel,
  .agenda-appointments-section {
    width: 100%;
  }

  .agenda-summary-panel,
  .agenda-filter-panel,
  .agenda-calendar-panel {
    border-radius: 1.25rem;
  }

  .agenda-summary-panel :deep(.app-panel),
  .agenda-filter-panel :deep(.app-panel),
  .agenda-calendar-panel :deep(.app-panel) {
    padding: 1rem;
  }

  .agenda-summary-panel :deep(.app-panel__title),
  .agenda-calendar-panel :deep(.app-panel__title) {
    font-size: 1rem;
  }

  .agenda-summary-panel :deep(.app-panel__subtitle) {
    font-size: 0.84rem;
    line-height: 1.35;
  }

  .agenda-filter-bar {
    gap: 0.85rem;
  }

  .agenda-month-controls {
    grid-template-columns: 2.8rem minmax(0, 1fr) 2.8rem;
    gap: 0.55rem;
    align-items: center;
  }

  .agenda-month-selects {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.55rem;
  }

  .agenda-current-button {
    height: 2.9rem !important;
    min-height: 2.9rem !important;
  }

  .agenda-calendar-grid {
    gap: 0.35rem;
  }

  .agenda-weekday {
    padding-top: 0;
    font-size: 0.62rem;
    letter-spacing: 0.03em;
  }

  .agenda-day {
    min-height: 2.95rem;
    aspect-ratio: 1;
    border-radius: 0.8rem;
  }

  .agenda-day__number {
    width: 1.55rem;
    height: 1.55rem;
    font-size: 0.8rem;
  }

  .agenda-day__indicator {
    top: 0.28rem;
    right: 0.28rem;
    width: 0.42rem;
    height: 0.42rem;
  }
}

@media (min-width: 900px) {
  .agenda-filter-bar {
    flex-direction: row;
    align-items: stretch;
    justify-content: space-between;
    min-height: 3rem;
  }

  .agenda-month-controls {
    flex: 1 1 auto;
    justify-content: start;
  }

  .agenda-current-button {
    width: auto;
    min-width: 160px;
  }
}
</style>

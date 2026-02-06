<template>
  <LayoutProfissional>
    <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-6 py-10 text-white">
      <div class="max-w-6xl mx-auto space-y-8">

        <!-- Cabeçalho -->
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-purple-400 tracking-wide">
            Agenda - {{ formatMonth(selectedMonth) }}
          </h1>
          <p class="mt-1 text-gray-400 text-sm">
            Visualize os agendamentos do mês selecionado.
          </p>
        </div>

        <!-- Filtro de mês -->
        <div class="bg-gray-950 p-6 rounded-2xl shadow-2xl border border-gray-800">
          <div class="flex flex-col sm:flex-row sm:items-center gap-4">
            <div class="flex-1 flex items-center gap-2">
              <button @click="previousMonth"
                class="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition shadow-md">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-300 mb-1">Selecionar Mês</label>
                <input type="month" v-model="selectedMonth" @change="fetchAppointments"
                  class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
              </div>

              <button @click="nextMonth"
                class="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition shadow-md">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button @click="resetFilter"
              class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition shadow-md hover:shadow-purple-500/20 text-sm">
              Mês Atual
            </button>
          </div>
        </div>

        <!-- Calendário -->
        <section class="bg-gray-950 p-6 rounded-2xl shadow-2xl border border-gray-800">
          <h2 class="text-xl font-extrabold text-purple-400 mb-4 tracking-wide">
            Calendário de Agendamentos
          </h2>

          <div class="grid grid-cols-7 gap-1 text-center">
            <div v-for="day in ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']" :key="day"
              class="bg-gray-800 text-gray-300 font-semibold py-3 text-sm uppercase">
              {{ day }}
            </div>

            <button v-for="day in calendarDays" :key="day.date" @click="selectDay(day)"
              :class="[
                'relative p-3 text-sm transition-all rounded-lg flex items-center justify-center',
                day.isCurrentMonth ? 'bg-gray-900 text-gray-200' : 'bg-gray-950 text-gray-600',
                day.hasAppointment ? 'border border-purple-500 shadow-md' : '',
                selectedDay && day.date === selectedDay.date
                  ? 'bg-purple-500 text-white ring-2 ring-purple-400'
                  : 'hover:bg-purple-500/20',
              ]">
              <span :class="[
                'h-8 w-8 flex items-center justify-center rounded-full',
                day.isToday ? 'bg-purple-500 text-white font-bold' : ''
              ]">
                {{ day.day }}
              </span>
              <span v-if="day.hasAppointment"
                class="absolute top-1 right-1 w-2.5 h-2.5 bg-purple-400 rounded-full"></span>
            </button>
          </div>
        </section>

        <!-- Lista de agendamentos -->
        <section v-if="selectedDay && selectedDayAppointments.length"
          class="bg-gray-950 p-6 rounded-2xl shadow-2xl border border-gray-800">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-extrabold text-purple-400 tracking-wide">
              Agendamentos - {{ formatSelectedDay(selectedDay.date) }}
            </h2>
            <button @click="selectedDay = null"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition shadow-md text-sm">
              Fechar
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-700">
              <thead class="bg-gray-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Serviço</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Horário</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Valor</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-800">
                <tr v-for="appointment in selectedDayAppointments" :key="appointment.id"
                  class="hover:bg-gray-800/50 transition">
                  <td class="px-6 py-4 text-sm text-gray-200">{{ appointment.service }}</td>
                  <td class="px-6 py-4 text-sm text-gray-200">{{ formatDateTime(appointment.time) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-200">R$ {{ appointment.value.toFixed(2) }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span :class="{
                      'text-green-400': appointment.status === 'Confirmado',
                      'text-yellow-400': appointment.status === 'Pendente'
                    }">
                      {{ appointment.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </LayoutProfissional>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router'; 
import axios from 'axios';
import LayoutProfissional from '@/components/LayoutProfissional.vue';

axios.defaults.baseURL = 'http://localhost:8000/api';

const router = useRouter();
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const selectedDay = ref(null);
const appointments = ref([]);

const selectedDayAppointments = computed(() => {
  if (!selectedDay.value) return [];
  return appointments.value
    .filter(appt => appt.time.split('T')[0] === selectedDay.value.date)
    .sort((a, b) => new Date(a.time) - new Date(b.time)); 
});

const calendarDays = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const today = new Date().toISOString().split('T')[0];
  const days = [];

  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, -i);
    days.push({ date: prevDate.toISOString().split('T')[0], day: prevDate.getDate(), isCurrentMonth: false, hasAppointment: false, isToday: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month - 1, i).toISOString().split('T')[0];
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      hasAppointment: appointments.value.some(appt => appt.time.split('T')[0] === date),
      isToday: date === today
    });
  }

  const total = 42 - days.length;
  for (let i = 1; i <= total; i++) {
    const nextDate = new Date(year, month, i);
    days.push({
      date: nextDate.toISOString().split('T')[0],
      day: nextDate.getDate(),
      isCurrentMonth: false,
      hasAppointment: false,
      isToday: false
    });
  }

  return days;
});

const formatMonth = (month) => {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum - 1);
  return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
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

const fetchAppointments = async () => {
  try {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    if (!token || !userId) return router.push('/');
    const response = await axios.get('/agendamentos/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    appointments.value = response.data.map(appointment => ({
      ...appointment,
      value: Number(appointment.value) || 0 
    }));
    if (selectedDay.value && !appointments.value.some(appt => appt.time.split('T')[0] === selectedDay.value.date)) {
      selectedDay.value = null;
    }
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
  }
};

const previousMonth = () => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const newDate = new Date(year, month - 2, 1);
  selectedMonth.value = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
  fetchAppointments();
};

const nextMonth = () => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  const newDate = new Date(year, month, 1);
  selectedMonth.value = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
  fetchAppointments();
};

const resetFilter = () => {
  selectedMonth.value = new Date().toISOString().slice(0, 7);
  selectedDay.value = null;
  fetchAppointments();
};

onMounted(() => {
  fetchAppointments();
});
</script>

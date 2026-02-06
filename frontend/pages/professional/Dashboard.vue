<template>
  <LayoutProfissional>
    <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-6 py-10 text-white">

      <!-- HEADER -->
      <header class="mb-10 text-center">
        <h1 class="text-4xl font-extrabold text-purple-400">Dashboard</h1>
        <p class="text-gray-400 mt-1">Acompanhe seus agendamentos e ganhos.</p>
      </header>

      <div v-if="errorMessage" class="text-red-400 text-center mb-4">
        {{ errorMessage }}
      </div>

      <!-- FILTROS -->
      <div class="bg-gray-950  backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow-xl mb-10">
        <div class="flex flex-col sm:flex-row sm:items-end gap-6">

          <div class="flex-1">
            <label class="text-sm font-medium text-gray-300">Data Inicial</label>
            <input
              type="date"
              v-model="startDate"
              class="mt-1 w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div class="flex-1">
            <label class="text-sm font-medium text-gray-300">Data Final</label>
            <input
              type="date"
              v-model="endDate"
              class="mt-1 w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div class="flex gap-4">
            <button
              @click="fetchFilteredAppointments"
              class="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold shadow hover:shadow-purple-500/20 transition"
            >
              Filtrar
            </button>

            <button
              @click="resetFilter"
              class="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
            >
              Limpar
            </button>
          </div>

        </div>
      </div>

      <!-- CARDS -->
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

        <div class="bg-gray-950  backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow text-center">
          <p class="text-sm text-gray-300">Total de Horários</p>
          <p class="text-3xl font-bold text-purple-400 mt-1">{{ totalFiltered }}</p>
        </div>

        <div class="bg-gray-950  backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow text-center">
          <p class="text-sm text-yellow-400">Pendentes</p>
          <p class="text-3xl font-bold text-yellow-400 mt-1">{{ pendingFiltered.length }}</p>
        </div>

        <div class="bg-gray-950  backdrop-blur-md p-6 rounded-2xl border border-gray-800 shadow text-center">
          <p class="text-sm text-green-400">Atendidos</p>
          <p class="text-3xl font-bold text-green-400 mt-1">{{ attendedFiltered.length }}</p>
        </div>

      </section>

      <!-- FATURAMENTO -->
      <section class="bg-gray-950  backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow mb-10">
        <h2 class="text-xl font-semibold text-purple-400 mb-2">Faturamento Total</h2>
        <p class="text-3xl font-bold text-purple-300">R$ {{ totalRevenue.toFixed(2) }}</p>
      </section>

      <!-- TABELA -->
      <section class="bg-gray-950  backdrop-blur-md border border-gray-800 p-6 rounded-2xl shadow">
        <h2 class="text-2xl font-semibold text-purple-400 mb-4">Agendamentos Filtrados</h2>

        <div v-if="filteredAppointmentsSorted.length === 0" class="text-gray-400 text-center py-4">
          Nenhum agendamento encontrado.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-left text-gray-300 divide-y divide-gray-700">
            <thead class="bg-gray-900/50">
              <tr>
                <th class="px-4 py-2 text-xs font-semibold uppercase">Serviço</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase">Horário</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase">Valor</th>
                <th class="px-4 py-2 text-xs font-semibold uppercase">Status</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-800">
              <tr
                v-for="appointment in filteredAppointmentsSorted"
                :key="appointment.id"
                class="hover:bg-gray-900/40 transition"
              >
                <td class="px-4 py-2">{{ appointment.service || "Não especificado" }}</td>
                <td class="px-4 py-2">{{ formatDateTime(appointment.time) }}</td>
                <td class="px-4 py-2">R$ {{ Number(appointment.value || 0).toFixed(2) }}</td>
                <td
                  class="px-4 py-2 font-semibold"
                  :class="{
                    'text-green-400': getStatus(appointment.time) === 'Atendido',
                    'text-yellow-400': getStatus(appointment.time) === 'Pendente',
                    'text-gray-500': getStatus(appointment.time) === 'Desconhecido'
                  }"
                >
                  {{ getStatus(appointment.time) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="text-center text-gray-500 text-sm mt-10 pb-4">
        © 2025 Blade Manager System. Todos os direitos reservados.
      </footer>

    </div>
  </LayoutProfissional>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import LayoutProfissional from '@/components/LayoutProfissional.vue';

axios.defaults.baseURL = 'http://localhost:8000/api';


const startDate = ref(new Date().toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);
const appointments = ref([]);
const errorMessage = ref('');


const formatDateTime = (dateStr) => {
  if (!dateStr) {
    console.warn('Data fornecida é nula ou indefinida');
    return 'Data inválida';
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    console.warn(`Data inválida recebida: ${dateStr}`);
    return 'Data inválida';
  }
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
};


const getStatus = (time) => {
  if (!time || isNaN(new Date(time).getTime())) return 'Desconhecido';
  const now = new Date();
  const apptTime = new Date(time);
  return apptTime > now ? 'Pendente' : 'Atendido';
};


const statusClasses = (time) => {
  const status = getStatus(time);
  return {
    'text-green-600': status === 'Atendido',
    'text-yellow-600': status === 'Pendente',
    'text-gray-600': status === 'Desconhecido',
  };
};


const filteredAppointmentsSorted = computed(() => {
  return filteredAppointments.value
    .filter(appt => appt.time && !isNaN(new Date(appt.time).getTime()))
    .sort((a, b) => new Date(a.time) - new Date(b.time));
});


const filteredAppointments = computed(() => {
  const start = new Date(startDate.value + 'T00:00:00-03:00');
  const end = new Date(endDate.value + 'T23:59:59-03:00');
  return appointments.value.filter(appt => {
    if (!appt.time || isNaN(new Date(appt.time).getTime())) return false;
    const apptDate = new Date(appt.time);
    return apptDate >= start && apptDate <= end;
  });
});


const totalFiltered = computed(() => filteredAppointmentsSorted.value.length);
const pendingFiltered = computed(() =>
  filteredAppointmentsSorted.value.filter(appt => {
    if (!appt.time || isNaN(new Date(appt.time).getTime())) return false;
    return new Date(appt.time) > new Date();
  })
);
const attendedFiltered = computed(() =>
  filteredAppointmentsSorted.value.filter(appt => {
    if (!appt.time || isNaN(new Date(appt.time).getTime())) return false;
    return new Date(appt.time) <= new Date();
  })
);


const totalRevenue = computed(() =>
  filteredAppointments.value.reduce((acc, appt) => {
    if (!appt.time || isNaN(new Date(appt.time).getTime())) return acc;
    const isAttended = new Date(appt.time) <= new Date();
    const value = isAttended ? Number(appt.value) || 0 : 0;
    return acc + value;
  }, 0)
);


const fetchFilteredAppointments = async () => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      errorMessage.value = 'Por favor, faça login novamente.';
      console.error('Token não encontrado');
      return;
    }

    const response = await axios.get('/agendamentos/me', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        startDate: startDate.value,
        endDate: endDate.value,
      },
    });

    if (!Array.isArray(response.data)) {
      throw new Error('Dados retornados não são um array');
    }

    appointments.value = response.data;
    errorMessage.value = '';
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error);
    errorMessage.value = 'Erro ao carregar agendamentos. Tente novamente.';
    appointments.value = [];
  }
};


const resetFilter = () => {
  startDate.value = new Date().toISOString().split('T')[0];
  endDate.value = new Date().toISOString().split('T')[0];
  fetchFilteredAppointments();
};


onMounted(fetchFilteredAppointments);
</script>

<style scoped>

</style>
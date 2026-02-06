<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 py-8 px-4 text-white overflow-x-hidden">
    <div class="max-w-7xl mx-auto">

      <!-- HEADER -->
      <div class="text-center mb-12">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-purple-400 tracking-wide">
          Escolha seu corte perfeito
        </h1>
        <p class="mt-3 text-gray-400 text-sm">Toque no serviço para agendar</p>
      </div>

      <!-- LOADING -->
      <div v-if="isLoading" class="flex flex-col items-center py-24">
        <div class="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-6 text-purple-400 font-medium">Carregando serviços...</p>
      </div>

      <!-- GRID DE SERVIÇOS -->
      <div v-else-if="services.length > 0" class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="service in services" :key="service.id"
          class="bg-gray-950 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-purple-500/20 hover:border-purple-500/30 cursor-pointer"
          @click="openCalendar(service)">
          
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <h2 class="text-xl font-extrabold text-purple-400 tracking-wide line-clamp-2 flex-1 pr-2">
                {{ service.nome }}
              </h2>
            </div>
            
            <div class="space-y-3 mb-6">
              <div class="flex items-center gap-3">
                <span class="text-xl">Duração:</span>
                <span class="text-gray-300">{{ service.duracao_minutos }} minutos</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-2xl">Valor:</span>
                <span class="text-2xl font-extrabold text-green-400">
                  R$ {{ Number(service.preco).toFixed(2) }}
                </span>
              </div>
            </div>

            <button class="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-purple-500/20">
              Agendar Agora
            </button>
          </div>
        </div>
      </div>

      <!-- SEM SERVIÇOS -->
      <div v-else class="text-center py-24">
        <p class="text-xl text-gray-400">Nenhum serviço disponível no momento.</p>
      </div>

      <!-- MODAL CALENDÁRIO (PADRÃO LOGIN) -->
      <Teleport to="body">
        <div v-if="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="w-full max-w-md bg-gray-950 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800 max-h-[95vh] overflow-y-auto">
            
            <div class="p-8">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-extrabold text-purple-400 tracking-wide">
                  {{ selectedService?.nome }}
                </h2>
                <button @click="closeModal"
                  class="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- NAVEGAÇÃO DO MÊS -->
              <div class="flex items-center justify-between mb-6">
                <button @click="prevMonth"
                  class="p-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition shadow-md">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <h3 class="text-xl font-extrabold text-purple-400">
                  {{ monthNames[currentMonth.value] }} {{ currentYear.value }}
                </h3>

                <button @click="nextMonth"
                  class="p-3 bg-purple-500 hover:bg-purple-600 rounded-lg transition shadow-md">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <!-- DIAS DA SEMANA -->
              <div class="grid grid-cols-7 gap-2 mb-4">
                <div v-for="d in ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']" :key="d"
                  class="text-center text-xs font-medium text-gray-300 py-2">
                  {{ d }}
                </div>
              </div>

              <!-- CALENDÁRIO -->
              <div class="grid grid-cols-7 gap-2">
                <div v-for="blank in blanks" :key="'blank'+blank"></div>
                
                <button v-for="day in daysInMonth" :key="day"
                  @click="selectDate(day)"
                  class="h-10 w-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center"
                  :class="[
                    isPastDate(day) 
                      ? 'bg-gray-900/50 text-gray-600 cursor-not-allowed' 
                      : selectedDate === day 
                        ? 'bg-purple-500 text-white shadow-md' 
                        : 'bg-gray-900 hover:bg-purple-500/20 text-gray-300'
                  ]"
                  :disabled="isPastDate(day)">
                  {{ day }}
                </button>
              </div>

              <!-- HORÁRIOS -->
              <div v-if="selectedDate" class="mt-8 space-y-4">
                <h3 class="text-lg font-semibold text-gray-300 text-center">
                  Horários disponíveis
                </h3>
                
                <div class="grid grid-cols-3 gap-3">
                  <button v-for="time in availableTimes" :key="time"
                    @click="selectTime(time)"
                    class="py-3 rounded-lg text-sm font-medium transition"
                    :class="selectedTime === time 
                      ? 'bg-purple-500 text-white shadow-md' 
                      : 'bg-gray-900 text-gray-300 border border-gray-700 hover:bg-purple-500/20'">
                    {{ time }}
                  </button>
                </div>
              </div>

              <!-- BOTÕES FINAIS -->
              <div v-if="selectedDate && selectedTime" class="mt-8 space-y-3">
                <button @click="confirmBooking"
                  class="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-purple-500/20">
                  Confirmar Agendamento
                </button>
                
                <button @click="closeModal"
                  class="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const services = ref([]);
const isLoading = ref(true);

const showModal = ref(false);
const selectedService = ref(null);
const selectedDate = ref(null);
const selectedTime = ref(null);

const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const daysInMonth = computed(() =>
  new Array(new Date(currentYear.value, currentMonth.value + 1, 0).getDate())
    .fill(0)
    .map((_, i) => i + 1)
);
const blanks = computed(() =>
  new Array(new Date(currentYear.value, currentMonth.value, 1).getDay()).fill(0)
);

const isPastDate = (day) => {
  const selected = new Date(currentYear.value, currentMonth.value, day);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return selected < now;
};

// ---- NOVO SISTEMA DE HORÁRIOS ----
const availableTimes = ref([]);
const workingHours = ref([]);

// Busca horários de funcionamento do barbeiro
const fetchWorkingHours = async () => {
  try {
    const profissionalId = route.params.profissionalId;
    const response = await axios.get(`/api/horarios/${profissionalId}`);
    workingHours.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar horários de funcionamento:", error);
  }
};

// Gera horários com base na abertura e fechamento
const generateTimes = (horaInicio, horaFim) => {
  const times = [];
  const [hStart, mStart] = horaInicio.split(":").map(Number);
  const [hEnd, mEnd] = horaFim.split(":").map(Number);
  const start = hStart * 60 + mStart;
  const end = hEnd * 60 + mEnd;

  for (let m = start; m <= end; m += 15) {
    const h = Math.floor(m / 60);
    const mm = (m % 60).toString().padStart(2, "0");
    times.push(`${h.toString().padStart(2, "0")}:${mm}`);
  }

  return times;
};

// Busca horários ocupados e aplica filtro
const fetchOccupiedTimes = async (date) => {
  try {
    const formattedDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    const response = await axios.get(`/api/agendamentos/${route.params.profissionalId}/${formattedDate}`);
    const occupiedTimes = response.data.map(item => item.horario.slice(0, 5));
    availableTimes.value = availableTimes.value.filter(time => !occupiedTimes.includes(time));
  } catch (error) {
    console.error("Erro ao buscar horários ocupados:", error);
  }
};

// Seleciona o dia e carrega horários conforme o funcionamento
const selectDate = async (day) => {
  if (isPastDate(day)) return;

  selectedDate.value = day;
  selectedTime.value = null;

  const selectedFullDate = new Date(currentYear.value, currentMonth.value, day);
  const weekDays = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const diaSemana = weekDays[selectedFullDate.getDay()];

  const dia = workingHours.value.find(d => d.dia_semana === diaSemana);

  if (!dia || !dia.hora_abertura || !dia.hora_fechamento) {
    availableTimes.value = [];
    return;
  }

  availableTimes.value = generateTimes(dia.hora_abertura, dia.hora_fechamento);
  await fetchOccupiedTimes(day);
};

// ---- RESTO DO CÓDIGO ORIGINAL ----
const fetchServices = async () => {
  isLoading.value = true;
  try {
    const profissionalId = route.params.profissionalId;
    const response = await axios.get(`/api/servicos/${profissionalId}`);
    services.value = response.data;
  } catch (error) {
    console.error("Erro ao buscar serviços:", error.response?.data || error.message);
  } finally {
    isLoading.value = false;
  }
};

const openCalendar = (service) => {
  selectedService.value = service;
  showModal.value = true;
  selectedDate.value = null;
  selectedTime.value = null;
  availableTimes.value = [];
};

const closeModal = () => {
  showModal.value = false;
};

const selectTime = (time) => {
  selectedTime.value = time;
};

const confirmBooking = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      sessionStorage.setItem("redirectAfterRegister", route.params.profissionalId);
      router.push("/register");
      return;
    }

    const { data: userData } = await axios.get(`/api/usuarios/${route.params.profissionalId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    let numero = userData.telefone?.replace(/\D/g, "");
    if (!numero) {
      alert("Número do profissional não disponível.");
      return;
    }

    const formattedDate = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, "0")}-${String(selectedDate.value).padStart(2, "0")} ${selectedTime.value}:00`;

    const appointmentData = {
      servico_id: selectedService.value.id,
      data_hora: formattedDate,
      barbeiro_id: route.params.profissionalId,
    };

    await axios.post("/api/agendamentos", appointmentData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const mensagem = `Novo agendamento!\n\nServiço: ${selectedService.value.nome}\nData: ${selectedDate.value}/${currentMonth.value + 1}/${currentYear.value}\nHorário: ${selectedTime.value}`;
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, "_blank");

    closeModal();
    alert("Agendamento confirmado com sucesso!");
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message === "Horário já ocupado!") {
      alert("Este horário já está ocupado. Escolha outro.");
    } else {
      alert("Erro ao agendar: " + (error.response?.data.message || error.message));
    }
  }
};

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
};

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
};

onMounted(async () => {
  await fetchServices();
  await fetchWorkingHours();
});
</script>

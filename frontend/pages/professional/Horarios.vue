<template>
  <LayoutProfissional>
    <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-6 py-10 text-white">
      <div class="max-w-6xl mx-auto space-y-8">

        <!-- Cabeçalho -->
        <div class="bg-gray-950 p-4 sm:p-6 rounded-xl shadow-md border border-gray-800 overflow-x-auto">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div class="flex items-start gap-4">
              <div class="p-3 rounded-lg bg-purple-800/20 text-purple-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 12v7" />
                </svg>
              </div>
              <div>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-white">
                  Horários de Funcionamento
                </h1>
                <p class="mt-1 text-gray-300 text-sm">
                  Defina dias e horários de atendimento. Esses horários aparecem para clientes ao agendar.
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button @click="openCreateModal"
                class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg shadow-md transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Novo Horário
              </button>
            </div>
          </div>
        </div>

        <!-- Loading / Erro -->
        <div v-if="loading" class="text-center py-12 text-purple-400">
          Carregando horários...
        </div>
        <div v-if="errorMessage" class="bg-red-900/20 border border-red-800 text-red-300 px-6 py-4 rounded-lg">
          {{ errorMessage }}
        </div>

        <!-- Tabela de Horários -->
        <div class="bg-gray-950 p-4 sm:p-6 rounded-xl shadow-md border border-gray-800 overflow-x-auto">
          <table v-if="horarios.length" class="min-w-full table-auto">
            <thead>
              <tr class="text-left text-xs text-gray-400 uppercase">
                <th class="px-4 py-3">Dia</th>
                <th class="px-4 py-3">Abertura</th>
                <th class="px-4 py-3">Fechamento</th>
                <th class="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="horario in horariosSorted" :key="horario.id" class="border-t border-gray-800 hover:bg-gray-900/40 transition">
                <td class="px-4 py-4 text-sm text-gray-200">{{ formatarDiaSemana(horario.dia_semana) }}</td>
                <td class="px-4 py-4 text-sm text-gray-200">{{ formatarHora(horario.hora_abertura) }}</td>
                <td class="px-4 py-4 text-sm text-gray-200">{{ formatarHora(horario.hora_fechamento) }}</td>
                <td class="px-4 py-4 text-sm text-gray-200 flex gap-3">
                  <button @click="openEditModal(horario)" title="Editar" class="p-2 rounded-md bg-gray-800 hover:bg-purple-800/60 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536M9 11l6 6L21 11l-6-6-6 6z" />
                    </svg>
                  </button>
                  <button @click="openDeleteModal(horario.id)" title="Excluir" class="p-2 rounded-md bg-gray-800 hover:bg-red-700/60 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="text-center py-12 text-gray-400">
            <div class="inline-flex flex-col items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z" />
              </svg>
              <div class="text-lg font-semibold">Nenhum horário cadastrado</div>
              <div class="text-sm text-gray-400">Clique em "Novo Horário" para adicionar os seus dias de atendimento.</div>
            </div>
          </div>
        </div>

        <!-- Modal Criação/Edição -->
        <div v-if="showModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div class="bg-gradient-to-b from-gray-950 to-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-800 max-w-lg w-full">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl sm:text-2xl font-bold text-white">{{ editingId ? 'Editar Horário' : 'Novo Horário' }}</h2>
              <button @click="closeModal" class="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="salvarHorario" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Dia da Semana</label>
                <select v-model="formData.dia_semana" required class="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Selecionar...</option>
                  <option value="segunda">Segunda-feira</option>
                  <option value="terca">Terça-feira</option>
                  <option value="quarta">Quarta-feira</option>
                  <option value="quinta">Quinta-feira</option>
                  <option value="sexta">Sexta-feira</option>
                  <option value="sabado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Hora de Abertura</label>
                  <input v-model="formData.hora_abertura" type="time" required class="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-2">Hora de Fechamento</label>
                  <input v-model="formData.hora_fechamento" type="time" required class="w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md">Cancelar</button>
                <button type="submit" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">Salvar</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Exclusão -->
        <div v-if="showDeleteModal"
          class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-950 p-8 rounded-xl shadow-2xl border border-red-600/50 max-w-sm w-full text-center">
            <h2 class="text-2xl font-bold text-red-400 mb-4">Confirmar Exclusão</h2>
            <p class="text-gray-400 mb-8">Tem certeza que deseja excluir este horário?</p>
            <div class="flex gap-4">
              <button @click="showDeleteModal = false"
                class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition">
                Cancelar
              </button>
              <button @click="deletarHorario"
                class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">
                Deletar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </LayoutProfissional>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import LayoutProfissional from '@/components/LayoutProfissional.vue';

axios.defaults.baseURL = 'http://localhost:8000/api';

const horarios = ref([]);
const loading = ref(true);
const errorMessage = ref('');
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingId = ref(null);
const deletingId = ref(null);
const userId = sessionStorage.getItem('userId');

const formData = ref({
  dia_semana: '',
  hora_abertura: '',
  hora_fechamento: '',
});

const horariosSorted = computed(() => {
  const ordem = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  return [...horarios.value].sort((a, b) => {
    return ordem.indexOf(a.dia_semana) - ordem.indexOf(b.dia_semana);
  });
});

const formatarDiaSemana = (dia) => {
  const dias = {
    'segunda': 'Segunda-feira',
    'terca': 'Terça-feira',
    'quarta': 'Quarta-feira',
    'quinta': 'Quinta-feira',
    'sexta': 'Sexta-feira',
    'sabado': 'Sábado',
    'domingo': 'Domingo',
  };
  return dias[dia] || dia;
};

const formatarHora = (hora) => {
  if (!hora) return '-';
  if (hora.length === 5) return hora;
  return hora.substring(0, 5);
};

const fetchHorarios = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const token = sessionStorage.getItem('token');
    const response = await axios.get(`/horarios/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    horarios.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar horários:', error);
    errorMessage.value = 'Erro ao carregar horários. Tente novamente.';
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingId.value = null;
  formData.value = {
    dia_semana: '',
    hora_abertura: '',
    hora_fechamento: '',
  };
  showModal.value = true;
};

const openEditModal = (horario) => {
  editingId.value = horario.id;
  formData.value = {
    dia_semana: horario.dia_semana,
    hora_abertura: horario.hora_abertura,
    hora_fechamento: horario.hora_fechamento,
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingId.value = null;
};

const salvarHorario = async () => {
  try {
    const token = sessionStorage.getItem('token');
    
    if (editingId.value) {
      // Atualizar
      await axios.put(`/horarios/${editingId.value}`, formData.value, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      // Criar
      await axios.post('/horarios', {
        usuarios_id: Number(userId),
        ...formData.value
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    
    closeModal();
    await fetchHorarios();
  } catch (error) {
    console.error('Erro ao salvar horário:', error);
    errorMessage.value = error.response?.data?.message || 'Erro ao salvar horário.';
  }
};

const openDeleteModal = (id) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const deletarHorario = async () => {
  try {
    const token = sessionStorage.getItem('token');
    await axios.delete(`/horarios/${deletingId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    showDeleteModal.value = false;
    deletingId.value = null;
    await fetchHorarios();
  } catch (error) {
    console.error('Erro ao deletar horário:', error);
    errorMessage.value = error.response?.data?.message || 'Erro ao deletar horário.';
  }
};

onMounted(() => {
  if (!userId) {
    window.location.href = '/login';
  } else {
    fetchHorarios();
  }
});
</script>

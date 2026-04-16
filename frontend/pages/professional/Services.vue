<template>
  <LayoutProfissional>
    <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-6 py-10 text-white">
      <div class="max-w-6xl mx-auto space-y-8">

        <!-- Cabeçalho -->
        <div class="bg-gray-950 p-8 rounded-xl shadow-md border border-gray-800">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold text-purple-400">
                Gerenciamento de Serviços
              </h1>
              <p class="mt-2 text-purple-200/80 text-sm">
                Gerencie, edite e organize os serviços oferecidos.
              </p>
            </div>
            <button @click="openCreateModal"
              class="px-6 py-3 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-800 transition shadow-md">
              + Novo Serviço
            </button>
          </div>
        </div>

        <!-- Tabela -->
        <div class="bg-gray-950 p-6 rounded-xl shadow-md border border-gray-800 overflow-x-auto">
          <table v-if="services.length" class="min-w-full divide-y divide-gray-700">
            <thead class="bg-gray-800">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase">Nome</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase">Preço (R$)</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase">Duração (min)</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="service in services" :key="service.id"
                class="hover:bg-purple-800/20 transition">
                <td class="px-6 py-4 text-sm text-gray-200">{{ service.nome }}</td>
                <td class="px-6 py-4 text-sm text-gray-200">{{ service.preco }}</td>
                <td class="px-6 py-4 text-sm text-gray-200">{{ service.duracao_minutos }}</td>
                <td class="px-6 py-4 text-sm space-x-4">
                  <button @click="openEditModal(service)"
                    class="text-purple-400 hover:text-purple-300 font-semibold">Editar</button>
                  <button @click="openDeleteModal(service.id)"
                    class="text-pink-400 hover:text-pink-300 font-semibold">Excluir</button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="text-center py-10 text-purple-300">
            Nenhum serviço encontrado.
          </div>
        </div>

        <!-- Modais (mantidos com o mesmo purple theme) -->
        <!-- Modal Criação -->
        <div v-if="showCreateModal"
          class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-950 p-8 rounded-xl shadow-2xl border border-purple-600/50 max-w-md w-full">
            <h2 class="text-2xl font-bold text-purple-400 mb-6">Novo Serviço</h2>
            <form @submit.prevent="handleCreate" class="space-y-5">
              <input v-model="newService.name" required placeholder="Nome do serviço"
                class="w-full p-3 bg-gray-800 border border-purple-500/40 rounded-lg focus:ring-2 focus:ring-purple-600 text-white" />
              <input v-model.number="newService.duration" type="number" min="1" required placeholder="Duração (min)"
                class="w-full p-3 bg-gray-800 border border-purple-500/40 rounded-lg focus:ring-2 focus:ring-purple-600 text-white" />
              <input v-model.number="newService.price" type="number" step="0.01" min="0.01" required placeholder="Preço (R$)"
                class="w-full p-3 bg-gray-800 border border-purple-500/40 rounded-lg focus:ring-2 focus:ring-purple-600 text-white" />
              <div class="flex gap-3 justify-end">
                <button type="button" @click="closeModal('create')"
                  class="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">Cancelar</button>
                <button type="submit"
                  class="px-5 py-2 bg-purple-700 hover:bg-purple-800 rounded-lg">Salvar</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Edição (igual, só muda título e dados) -->
        <div v-if="showEditModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-950 p-8 rounded-xl shadow-2xl border border-purple-600/50 max-w-md w-full">
            <h2 class="text-2xl font-bold text-purple-400 mb-6">Editar Serviço</h2>
            <form @submit.prevent="handleUpdate" class="space-y-5">
              <input v-model="editService.name" required
                class="w-full p-3 bg-gray-800 border border-purple-500/40 rounded-lg focus:ring-2 focus:ring-purple-600 text-white" />
              <input v-model.number="editService.duration" type="number" min="1" required
                class="w-full p-3 bg-gray-800 border border-purple-500/40 rounded-lg focus:ring-2 focus:ring-purple-600 text-white" />
              <input v-model.number="editService.price" type="number" step="0.01" min="0.01" required
                class="w-full p-3 bg-gray-800 border border-purple-500/40 rounded-lg focus:ring-2 focus:ring-purple-600 text-white" />
              <div class="flex gap-3 justify-end">
                <button type="button" @click="closeModal('edit')"
                  class="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">Cancelar</button>
                <button type="submit"
                  class="px-5 py-2 bg-purple-700 hover:bg-purple-800 rounded-lg">Atualizar</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Modal Exclusão -->
        <div v-if="showDeleteModal"
          class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-950 p-8 rounded-xl shadow-2xl border border-purple-600/50 max-w-sm w-full text-center">
            <h2 class="text-xl font-bold text-purple-400 mb-4">Confirmar Exclusão</h2>
            <p class="text-purple-200 mb-6">Tem certeza que deseja excluir este serviço?</p>
            <div class="flex gap-4 justify-center">
              <button @click="closeModal('delete')"
                class="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">Cancelar</button>
              <button @click="handleDelete"
                class="px-5 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg">Excluir</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </LayoutProfissional>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import LayoutProfissional from '@/components/LayoutProfissional.vue';

const router = useRouter();
const route = useRoute();
const services = ref([]);
const user = ref({});
const isLoading = ref(true);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const newService = ref({ name: '', duration: '', price: '' });
const editService = ref({ id: '', name: '', duration: '', price: '' });
const deleteServiceId = ref(null);

const getSession = () => {
  return {
    userId: sessionStorage.getItem('userId'),
    token: sessionStorage.getItem('token')
  };
};

const fetchServices = async () => {
  isLoading.value = true;
  const { userId, token } = getSession();
  try {
    if (!token || !userId) {
      router.push('/');
      return;
    }
    const response = await axios.get(`/servicos/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    services.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar serviços:', error.response?.status, error.response?.data || error.message);
  } finally {
    isLoading.value = false;
  }
};

const fetchUser = async () => {
  const { userId, token } = getSession();
  try {
    if (!token || !userId) {
      router.push('/');
      return;
    }
    const response = await axios.get(`/usuarios/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    user.value = response.data;
  } catch (error) {
    console.error('Erro ao carregar usuário:', error.response?.status, error.response?.data || error.message);
  }
};

const openCreateModal = () => {
  newService.value = { name: '', duration: '', price: '' };
  showCreateModal.value = true;
};

const openEditModal = (service) => {
  editService.value = { id: service.id, name: service.nome, duration: service.duracao_minutos, price: service.preco };
  showEditModal.value = true;
};

const openDeleteModal = (id) => {
  deleteServiceId.value = id;
  showDeleteModal.value = true;
};

const closeModal = (type) => {
  if (type === 'create') showCreateModal.value = false;
  if (type === 'edit') showEditModal.value = false;
  if (type === 'delete') showDeleteModal.value = false;
};

const handleCreate = async () => {
  const { userId, token } = getSession();
  try {
    if (!newService.value.name || !newService.value.price || !newService.value.duration) {
      return alert('Preencha todos os campos obrigatórios.');
    }
    await axios.post('/servicos', {
      nome: newService.value.name,
      preco: newService.value.price,
      duracao_minutos: newService.value.duration,
      barbeiro_id: parseInt(userId)
    }, { headers: { Authorization: `Bearer ${token}` } });
    alert('Serviço criado!');
    await fetchServices();
    closeModal('create');
  } catch (error) {
    console.error('Erro ao criar serviço:', error.response?.data || error.message);
    alert(error.response?.data?.message || 'Erro ao criar serviço.');
  }
};

const handleUpdate = async () => {
  const { token } = getSession();
  try {
    await axios.put(`/servicos/${editService.value.id}`, {
      nome: editService.value.name,
      preco: editService.value.price,
      duracao_minutos: editService.value.duration
    }, { headers: { Authorization: `Bearer ${token}` } });
    alert('Serviço atualizado!');
    await fetchServices();
    closeModal('edit');
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error.response?.data || error.message);
    alert(error.response?.data?.message || 'Erro ao atualizar.');
  }
};

const handleDelete = async () => {
  const { token } = getSession();
  try {
    await axios.delete(`/servicos/${deleteServiceId.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Serviço excluído!');
    await fetchServices();
    closeModal('delete');
  } catch (error) {
    console.error('Erro ao excluir serviço:', error.response?.data || error.message);
    alert(error.response?.data?.message || 'Erro ao excluir.');
  }
};

onMounted(async () => {
  await fetchUser();
  await fetchServices();
});


watch(
  () => route.fullPath,
  async () => {
    await fetchServices();
  }
);
</script>
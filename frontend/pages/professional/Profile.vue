<template>
  <LayoutProfissional>
    <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-6 py-10 text-white">
      <div class="max-w-6xl mx-auto space-y-8">

        <!-- Cabeçalho -->
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-purple-400">
            Perfil
          </h1>
          <p class="mt-1 text-gray-400 text-sm">
            Veja ou atualize seus dados profissionais.
          </p>
        </div>

        <!-- Loading / Erro -->
        <div v-if="loading" class="text-center py-12 text-purple-400">
          Carregando...
        </div>
        <div v-if="errorMessage" class="bg-red-900/20 border border-red-800 text-red-300 px-6 py-4 rounded-lg">
          {{ errorMessage }}
        </div>

        <!-- Formulário + Botões -->
        <div class="bg-gray-950 p-8 rounded-2xl shadow-2xl border border-gray-800">
          <form @submit.prevent="updateUser" class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Nome</label>
              <input v-model="user.nome_usuario" type="text" required
                class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input v-model="user.email" type="email" required
                class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
              <input v-model="user.telefone" type="tel"
                class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
              <input v-model="newPassword" type="password"
                class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
            </div>

            <!-- Botões -->
            <div class="flex justify-between items-center pt-4">
              <button @click="openDeleteModal" type="button"
                class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition shadow-md">
                Deletar Conta
              </button>

              <button type="submit"
                class="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-purple-500/20">
                Salvar Alterações
              </button>
            </div>
          </form>

          <!-- Link do perfil -->
          <div v-if="user.profileLink" class="mt-8 pt-6 border-t border-gray-800">
            <p class="text-sm text-gray-400">
              Seu link de perfil:
              <a :href="user.profileLink" target="_blank"
                class="text-purple-400 hover:text-purple-300 hover:underline transition">
                {{ user.profileLink }}
              </a>
            </p>
          </div>
        </div>

        <!-- Modal exclusão -->
        <div v-if="showDeleteModal"
          class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div class="bg-gray-950 p-8 rounded-2xl shadow-2xl border border-gray-800 max-w-sm w-full text-center">
            <h2 class="text-2xl font-extrabold text-purple-400 mb-4">Confirmar Exclusão</h2>
            <p class="text-gray-400 mb-8">
              Tem certeza que deseja deletar sua conta? Essa ação é irreversível.
            </p>
            <div class="flex gap-4 justify-center">
              <button @click="showDeleteModal = false"
                class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                Cancelar
              </button>
              <button @click="handleDeleteAccount"
                class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
                Deletar Conta
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </LayoutProfissional>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import LayoutProfissional from '@/components/LayoutProfissional.vue';

const router = useRouter();
const user = ref({});
const newPassword = ref('');
const loading = ref(true);
const errorMessage = ref('');
const showDeleteModal = ref(false);
const userId = sessionStorage.getItem('userId');

const fetchUser = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const token = sessionStorage.getItem('token');
    if (!token || !userId) throw new Error('No token or userId');
    const response = await axios.get(`/usuarios/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    user.value = response.data;
    sessionStorage.setItem('user', JSON.stringify(user.value));
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    errorMessage.value = 'Erro ao carregar dados. Tente logar novamente.';
    if (error.response?.status === 401 || error.response?.status === 403) {
      sessionStorage.clear();
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

const updateUser = async () => {
  try {
    const token = sessionStorage.getItem('token');
    const payload = {
      nome_usuario: user.value.nome_usuario,
      email: user.value.email,
      telefone: user.value.telefone,
      nova_senha: newPassword.value || undefined
    };
    const response = await axios.put(`/usuarios/${userId}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    user.value = response.data;
    sessionStorage.setItem('user', JSON.stringify(user.value));
    alert('Perfil atualizado com sucesso!');
    await fetchUser();
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    alert(error.response?.data?.message || 'Erro ao atualizar perfil.');
  }
};

const openDeleteModal = () => {
  showDeleteModal.value = true;
};

const handleDeleteAccount = async () => {
  try {
    const token = sessionStorage.getItem('token');
    await axios.delete(`/usuarios/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Conta deletada!');
    sessionStorage.clear();
    router.push('/register');
  } catch (error) {
    alert(error.response?.data?.message || 'Erro ao deletar conta.');
  } finally {
    showDeleteModal.value = false;
  }
};

onMounted(() => {
  const savedUser = sessionStorage.getItem('user');
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser);
    } catch (e) {
      console.warn('Conteúdo de sessionStorage `user` inválido:', e);
      
      sessionStorage.removeItem('user');
    }
  }
  fetchUser();
});
</script>
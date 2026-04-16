<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4 py-12">
    <div class="w-full max-w-md bg-gray-950 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800 p-8">

      <h2 class="text-3xl font-extrabold text-center text-purple-400 mb-8 tracking-wide">
        Criar Conta
      </h2>

      <form @submit.prevent="registerUser" class="space-y-5">

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Nome</label>
          <input v-model="name" type="text" required
            class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"/>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input v-model="email" type="email" required
            class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"/>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Senha</label>
          <input v-model="password" type="password" required
            class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"/>
        </div>

        <div v-if="userType === 'barbeiro' || userType === 'admin'">
          <label class="block text-sm font-medium text-gray-300 mb-1">Telefone (WhatsApp)</label>
          <input v-model="telefone" type="tel" required @input="formatarTelefone"
            class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            placeholder="(11) 98765-4321" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Tipo de usuário</label>
          <select v-model="userType" required
            class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition">
            <option disabled value="">Selecione...</option>
            <option value="cliente">Cliente</option>
            <option value="barbeiro">Profissional</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <!-- Horários (só pro barbeiro) -->
        <div v-if="userType === 'barbeiro'" class="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
          <h3 class="text-lg font-semibold text-purple-400 mb-4">Horário de Funcionamento</h3>
          <div v-for="(dia, i) in horarios" :key="i" class="flex items-center justify-between mb-3">
            <span class="text-gray-300 capitalize w-24 text-sm">{{ dia.dia_semana }}</span>
            <div class="flex items-center gap-3">
              <input type="time" v-model="dia.hora_abertura" required
                class="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500" />
              <span class="text-purple-400">→</span>
              <input type="time" v-model="dia.hora_fechamento" required
                class="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        </div>

        <button type="submit"
          class="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-purple-500/20">
          Registrar
        </button>
      </form>

      <p class="text-sm text-center text-gray-400 mt-6">
        Já tem uma conta?
        <RouterLink to="/" class="text-purple-400 hover:text-purple-300 hover:underline transition">
          Fazer login
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

const router = useRouter();
const route = useRoute();

const name = ref('');
const email = ref('');
const password = ref('');
const userType = ref('');
const telefone = ref('');

const horarios = ref([
  { dia_semana: 'segunda', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'terca', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'quarta', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'quinta', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'sexta', hora_abertura: '08:00', hora_fechamento: '18:00' },
  { dia_semana: 'sabado', hora_abertura: '09:00', hora_fechamento: '14:00' },
  { dia_semana: 'domingo', hora_abertura: '00:00', hora_fechamento: '00:00' }
]);

const formatarTelefone = (event) => {
  let valor = event.target.value.replace(/\D/g, '');
  if (valor.length > 11) valor = valor.slice(0, 11);
  telefone.value =
    valor.length <= 10
      ? valor.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
      : valor.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
};

const handleRegisterSuccess = async (userId) => {
  if (userType.value === 'barbeiro') {
    try {
      for (const dia of horarios.value) {
        await api.post('/horarios', {
          usuarios_id: userId,
          dia_semana: dia.dia_semana,
          hora_abertura: dia.hora_abertura,
          hora_fechamento: dia.hora_fechamento
        });
      }
    } catch (error) {
      console.error('Erro ao cadastrar horários:', error);
    }
  }

  const redirectPath = sessionStorage.getItem('redirectAfterRegister');
  if (redirectPath) {
    sessionStorage.removeItem('redirectAfterRegister');
    router.push(redirectPath);
  } else if (userType.value === 'admin') {
    router.push('/adm');
  } else if (userType.value === 'cliente') {
    const profissionalId = route.query.profissionalId;
    router.push(profissionalId ? `/agendar/${profissionalId}` : `/agendar/${userId}`);
  } else {
    router.push('/dashboard');
  }
};

const registerUser = async () => {
  if ((userType.value === 'barbeiro' || userType.value === 'admin') && !telefone.value) {
    alert('Telefone é obrigatório para barbeiro ou administrador.');
    return;
  }

  try {
    const payload = {
      nome_usuario: name.value,
      email: email.value,
      senha: password.value,
      tipo_usuario: userType.value,
      telefone: (userType.value === 'barbeiro' || userType.value === 'admin') ? telefone.value : null
    };

    const response = await api.post('/usuarios', payload);

    // Não armazenar token aqui pois o usuário precisa verificar email primeiro
    sessionStorage.setItem('user', JSON.stringify({
      id: response.data.userId,
      nome_usuario: name.value,
      tipo_usuario: userType.value
    }));
    sessionStorage.setItem('userId', response.data.userId);

    alert('Usuário registrado com sucesso! Verifique seu e-mail.');
    await handleRegisterSuccess(response.data.userId);
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao registrar usuário.';
    alert(message);
  }
};
</script>
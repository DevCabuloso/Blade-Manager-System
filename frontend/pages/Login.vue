<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4">
    <div class="w-full max-w-md bg-gray-950  backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-800">
      <h2 class="text-3xl font-extrabold text-center text-purple-400 mb-6 tracking-wide">
        Fazer Login
      </h2>

      <form @submit.prevent="loginUser" class="space-y-5">
        <!-- EMAIL -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
        </div>

        <!-- SENHA -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Senha</label>
          <input
            v-model="senha"
            type="password"
            class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          />
        </div>

        <!-- TIPO DE USUÁRIO -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Tipo de usuário</label>
          <select
            v-model="tipoUsuario"
            class="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            required
          >
            <option disabled value="">Selecione...</option>
            <option value="barbeiro">Profissional</option>
            <option value="cliente">Cliente</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        <!-- BOTÃO ENTRAR -->
        <button
          type="submit"
          class="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition shadow-md hover:shadow-purple-500/20"
        >
          Entrar
        </button>
      </form>

      <!-- REGISTRO -->
      <p class="text-sm text-center text-gray-400 mt-6">
        Não tem uma conta?
        <button
          @click="goToRegister"
          class="text-purple-400 hover:text-purple-300 hover:underline transition"
        >
          Criar conta
        </button>
      </p>

      <!-- FOOTER -->
      <footer class="mt-8 text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
        <p>© {{ new Date().getFullYear() }} Blade Manager System. Todos os direitos reservados.</p>
        <p class="text-[11px] text-gray-600 mt-1">Desenvolvido com 💜 por Karlos Eduardo</p>
      </footer>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      senha: '',
      tipoUsuario: '',
    };
  },
  methods: {
async loginUser() {
  try {
    const payload = { email: this.email, senha: this.senha };
    const response = await axios.post('/api/usuarios/login', payload, {
      baseURL: 'http://localhost:8000'
    });

    // Salva dados no sessionStorage
    sessionStorage.setItem('token', response.data.token);
    sessionStorage.setItem('user', JSON.stringify(response.data.user));
    sessionStorage.setItem('userId', response.data.user.id);
    sessionStorage.setItem('tipo_usuario', response.data.user.tipo_usuario);

    alert('Login realizado com sucesso!');

    const redirectPath = sessionStorage.getItem('redirectAfterAuth');
    const pendingId = sessionStorage.getItem('pendingProfissionalId');

    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterAuth');
      this.$router.push(redirectPath);
    } 
    else if (response.data.user.tipo_usuario === 'admin') {
      this.$router.push('/adm');
    } 
    else if (response.data.user.tipo_usuario === 'barbeiro') {
      this.$router.push('/dashboard');
    } 
    else if (response.data.user.tipo_usuario === 'cliente') {
      const profissionalId = pendingId || this.$route.query.profissionalId;
      sessionStorage.removeItem('pendingProfissionalId');
      
      if (profissionalId) {
        this.$router.push(`/agendar/${profissionalId}`);
      } else {
        this.$router.push('/');
      }
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao fazer login.';
    alert(message);
  }
},
    goToRegister() {
      const redirect = sessionStorage.getItem('redirectAfterAuth');
      if (redirect) {
        sessionStorage.setItem('redirectAfterRegister', redirect);
      } else {
        const profissionalId = this.$route.query.profissionalId;
        if (profissionalId) {
          sessionStorage.setItem('redirectAfterRegister', `/agendar/${profissionalId}`);
        }
      }
      this.$router.push('/register');
    },
  },
};
</script>

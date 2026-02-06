<template>
  <div class="min-h-screen bg-gray-50 py-6 sm:py-10">
    <div class="container mx-auto px-4 sm:px-6 lg:px-10 flex flex-col">
      
      <div class="mb-6 flex justify-end">
        <button
          @click="logout"
          class="px-3 sm:px-4 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-xs sm:text-sm flex items-center gap-2"
        >
          <svg
            class="w-4 sm:w-5 h-4 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          Voltar ao Login
        </button>
      </div>

      
      <h1
        class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 text-center mb-8 sm:mb-10"
      >
        Painel do Administrador
      </h1>

      
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10"
      >
        <div
          @click="$router.push('/adm/barbearias')"
          class="p-4 sm:p-6 bg-white rounded-2xl shadow hover:shadow-lg border border-gray-200 transition cursor-pointer"
        >
          <h2 class="text-lg sm:text-xl font-semibold text-green-600 mb-1 sm:mb-2">
            💈 Gestão de Barbearias
          </h2>
          <p class="text-gray-600 text-xs sm:text-sm">
            Ative, desative ou configure barbearias.
          </p>
        </div>

        <div
          @click="$router.push('/adm/relatorios')"
          class="p-4 sm:p-6 bg-white rounded-2xl shadow hover:shadow-lg border border-gray-200 transition cursor-pointer"
        >
          <h2 class="text-lg sm:text-xl font-semibold text-red-600 mb-1 sm:mb-2">
            📊 Relatórios
          </h2>
          <p class="text-gray-600 text-xs sm:text-sm">
            Veja métricas e status do sistema.
          </p>
        </div>
      </div>

      
      <div
        class="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-6 overflow-x-auto"
      >
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          👤 Profissionais Cadastrados
        </h2>

        <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

        <table class="w-full text-left border-collapse min-w-full">
          <thead>
            <tr class="bg-gray-100 text-gray-700">
              <th class="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">Nome</th>
              <th class="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">Email</th>
              <th class="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">Telefone</th>
              <th class="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">Status</th>
              <th class="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-800">
                {{ user.nome_usuario }}
              </td>
              <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600">
                {{ user.email }}
              </td>
              <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm text-gray-600">
                {{ user.telefone || "—" }}
              </td>
              <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm">
                <span
                  class="px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold"
                  :class="
                    user.ativo
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  "
                >
                  {{ user.ativo ? "Ativo" : "Suspenso" }}
                </span>
              </td>
              <td
                class="px-2 sm:px-4 py-2 flex flex-wrap gap-2 sm:gap-3"
              >
                <button
                  @click="confirmarAcao(user)"
                  class="px-2 sm:px-3 py-1 sm:py-1.5 text-white text-[10px] sm:text-xs rounded-lg transition"
                  :class="
                    user.ativo
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-green-500 hover:bg-green-600'
                  "
                >
                  {{ user.ativo ? "Suspender" : "Habilitar" }}
                </button>
                <button
                  @click="confirmarExclusao(user)"
                  class="px-2 sm:px-3 py-1 sm:py-1.5 bg-red-500 text-white text-[10px] sm:text-xs rounded-lg hover:bg-red-600 transition"
                >
                  Excluir
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0 && !error">
              <td
                colspan="5"
                class="px-2 sm:px-4 py-4 text-center text-gray-500 text-xs sm:text-sm"
              >
                Nenhum profissional cadastrado.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      
      <router-view />

      
      <transition name="fade">
        <div
          v-if="showModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <div
            class="bg-white rounded-2xl shadow-lg p-4 sm:p-6 max-w-sm w-full text-center"
          >
            <h3 class="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Confirmação</h3>
            <p class="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">
              {{ modalMessage }}
            </p>
            <div class="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <button
                @click="executarAcaoConfirmada"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Confirmar
              </button>
              <button
                @click="cancelarAcao"
                class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>



<script>
import axios from "axios";

export default {
  name: "Admin",
  data() {
    return {
      users: [],
      error: "",
      showModal: false,
      modalMessage: "",
      acao: null,
      usuarioSelecionado: null,
    };
  },
  async created() {
    await this.fetchProfissionais();
  },
  methods: {
    async fetchProfissionais() {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/usuarios/profissionais/all",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.users = response.data;
        this.error = "";
      } catch (error) {
        this.error = error.response?.data?.message || "Erro ao buscar profissionais.";
        this.users = [];
      }
    },

    logout() {
      sessionStorage.clear();
      this.$router.push("/");
    },

    confirmarExclusao(user) {
      this.usuarioSelecionado = user;
      this.modalMessage = `Deseja realmente excluir o usuário ${user.nome_usuario}?`;
      this.acao = this.excluirUsuario;
      this.showModal = true;
    },

    confirmarAcao(user) {
      this.usuarioSelecionado = user;
      if (user.ativo) {
        this.modalMessage = `Deseja realmente suspender o usuário ${user.nome_usuario}?`;
        this.acao = this.suspenderUsuario;
      } else {
        this.modalMessage = `Deseja realmente habilitar o usuário ${user.nome_usuario}?`;
        this.acao = this.habilitarUsuario;
      }
      this.showModal = true;
    },

    cancelarAcao() {
      this.showModal = false;
      this.usuarioSelecionado = null;
      this.acao = null;
    },
 
    async executarAcaoConfirmada() {
      if (this.acao && this.usuarioSelecionado) {
        try {
          await this.acao(this.usuarioSelecionado.id);
          alert("Ação realizada com sucesso!");
        } catch (error) {
          alert(error.response?.data?.message || "Erro ao executar ação.");
        }
      }
      this.cancelarAcao();
      await this.fetchProfissionais();
    },

    async suspenderUsuario(id) {
      const token = sessionStorage.getItem("token");
      return axios.put(
        `http://localhost:8000/api/usuarios/${id}/suspender`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },

    async habilitarUsuario(id) {
      const token = sessionStorage.getItem("token");
      return axios.put(
        `http://localhost:8000/api/usuarios/${id}/habilitar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },

    async excluirUsuario(id) {
      const token = sessionStorage.getItem("token");
      return axios.delete(`http://localhost:8000/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },
};
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
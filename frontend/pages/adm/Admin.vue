<template>
  <div class="admin-page">
    <div class="page-wrap d-flex flex-column ga-6">
      <v-card rounded="xl" color="rgba(3, 7, 18, 0.94)" border class="admin-shell-card">
        <v-toolbar color="transparent" density="comfortable" class="px-2">
          <v-toolbar-title class="text-white font-weight-bold">
            Administração
          </v-toolbar-title>
          <template #append>
            <AppButton variant="danger" @click="logout">
              Voltar ao Login
            </AppButton>
          </template>
        </v-toolbar>

        <v-card-text class="pt-2">
          <div class="d-flex flex-column ga-6">
            <AppPanel
              title="Painel do Administrador"
              subtitle="Gerencie profissionais, barbearias e relatórios com uma base visual mais consistente em desktop, tablet e celular."
              class="admin-intro"
            />

            <v-tabs
              :model-value="currentAdminRoute"
              color="primary"
              align-tabs="start"
              slider-color="primary"
              class="admin-tabs"
            >
              <v-tab
                v-for="item in navItems"
                :key="item.to"
                :value="item.to"
                @click="goTo(item.to)"
              >
                {{ item.label }}
              </v-tab>
            </v-tabs>

            <v-row dense>
              <v-col
                v-for="item in navItems"
                :key="`card-${item.to}`"
                cols="12"
                md="6"
              >
                <v-card
                  rounded="xl"
                  color="rgba(15, 23, 42, 0.72)"
                  border
                  class="h-100 cursor-pointer admin-nav-card"
                  @click="goTo(item.to)"
                >
                  <v-card-item>
                    <v-card-title :class="item.titleClass">
                      {{ item.label }}
                    </v-card-title>
                    <v-card-subtitle class="admin-card-subtitle">
                      {{ item.description }}
                    </v-card-subtitle>
                  </v-card-item>
                </v-card>
              </v-col>
            </v-row>

            <AppPanel title="Profissionais Cadastrados">
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                density="comfortable"
                class="mb-4"
              >
                {{ error }}
              </v-alert>

              <v-table class="d-none d-md-block admin-table" theme="dark">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th class="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id">
                    <td>{{ user.nome_usuario }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.telefone || '-' }}</td>
                    <td>
                      <v-chip
                        size="small"
                        :color="user.ativo ? 'success' : 'error'"
                        variant="tonal"
                      >
                        {{ user.ativo ? 'Ativo' : 'Suspenso' }}
                      </v-chip>
                    </td>
                    <td>
                      <div class="admin-table-actions">
                        <AppButton
                          :color="user.ativo ? 'warning' : 'success'"
                          variant="primary"
                          size="small"
                          @click="confirmarAcao(user)"
                        >
                          {{ user.ativo ? 'Suspender' : 'Habilitar' }}
                        </AppButton>
                        <AppButton
                          variant="danger"
                          size="small"
                          @click="confirmarExclusao(user)"
                        >
                          Excluir
                        </AppButton>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <div v-if="users.length === 0 && !error" class="mt-2">
                <AppEmptyState
                  title="Nenhum profissional cadastrado"
                  message="Quando novos profissionais forem cadastrados, eles aparecerão aqui."
                />
              </div>

              <div class="d-flex flex-column ga-3 d-md-none">
                <v-card
                  v-for="user in users"
                  :key="`mobile-${user.id}`"
                  rounded="xl"
                  color="rgba(15, 23, 42, 0.72)"
                  border
                >
                  <v-card-text>
                    <div class="d-flex align-start justify-space-between ga-3">
                      <div>
                        <h3 class="admin-mobile-user-name">{{ user.nome_usuario }}</h3>
                        <p class="admin-mobile-user-meta">{{ user.email }}</p>
                        <p class="admin-mobile-user-meta">{{ user.telefone || '-' }}</p>
                      </div>
                      <v-chip
                        size="small"
                        :color="user.ativo ? 'success' : 'error'"
                        variant="tonal"
                      >
                        {{ user.ativo ? 'Ativo' : 'Suspenso' }}
                      </v-chip>
                    </div>

                    <div class="d-flex flex-column ga-2 mt-4">
                      <AppButton
                        :color="user.ativo ? 'warning' : 'success'"
                        variant="primary"
                        block
                        @click="confirmarAcao(user)"
                      >
                        {{ user.ativo ? 'Suspender' : 'Habilitar' }}
                      </AppButton>
                      <AppButton variant="danger" block @click="confirmarExclusao(user)">
                        Excluir
                      </AppButton>
                    </div>
                  </v-card-text>
                </v-card>

                <AppEmptyState
                  v-if="users.length === 0 && !error"
                  title="Nenhum profissional cadastrado"
                  message="Quando novos profissionais forem cadastrados, eles aparecerão aqui."
                />
              </div>
            </AppPanel>

            <router-view />
          </div>
        </v-card-text>
      </v-card>

      <AppConfirmDialog
        v-model="showModal"
        title="Confirmação"
        :message="modalMessage"
        :confirm-text="confirmButtonText"
        :confirm-variant="confirmButtonVariant"
        @confirm="executarAcaoConfirmada"
        @cancel="cancelarAcao"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import AppButton from '@/components/ui/AppButton.vue';
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue';
import AppEmptyState from '@/components/ui/AppEmptyState.vue';
import AppPanel from '@/components/ui/AppPanel.vue';
import { notifyError, notifySuccess } from '@/utils/feedback.js';

export default {
  name: 'Admin',
  components: {
    AppButton,
    AppConfirmDialog,
    AppEmptyState,
    AppPanel,
  },
  data() {
    return {
      users: [],
      error: '',
      showModal: false,
      modalMessage: '',
      acao: null,
      usuarioSelecionado: null,
      confirmButtonText: 'Confirmar',
      confirmButtonVariant: 'danger',
      navItems: [
        {
          label: 'Barbearias',
          to: '/adm/barbearias',
          description: 'Cadastre, edite e exclua barbearias mantendo os fluxos atuais.',
          titleClass: 'text-emerald-300',
        },
        {
          label: 'Relatórios',
          to: '/adm/relatorios',
          description: 'Consulte indicadores administrativos e feedback visual de busca.',
          titleClass: 'text-rose-300',
        },
      ],
    };
  },
  computed: {
    currentAdminRoute() {
      return this.$route.path;
    },
  },
  async created() {
    await this.fetchProfissionais();
  },
  methods: {
    goTo(path) {
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
    },

    async fetchProfissionais() {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get('/api/usuarios/profissionais/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.users = response.data;
        this.error = '';
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao buscar profissionais.';
        this.users = [];
      }
    },

    logout() {
      sessionStorage.clear();
      localStorage.removeItem('blade_persistent_auth');
      this.$router.push('/');
    },

    confirmarExclusao(user) {
      this.usuarioSelecionado = user;
      this.modalMessage = `Deseja realmente excluir o usuário ${user.nome_usuario}?`;
      this.confirmButtonText = 'Excluir';
      this.confirmButtonVariant = 'danger';
      this.acao = this.excluirUsuario;
      this.showModal = true;
    },

    confirmarAcao(user) {
      this.usuarioSelecionado = user;
      if (user.ativo) {
        this.modalMessage = `Deseja realmente suspender o usuário ${user.nome_usuario}?`;
        this.confirmButtonText = 'Suspender';
        this.confirmButtonVariant = 'primary';
        this.acao = this.suspenderUsuario;
      } else {
        this.modalMessage = `Deseja realmente habilitar o usuário ${user.nome_usuario}?`;
        this.confirmButtonText = 'Habilitar';
        this.confirmButtonVariant = 'success';
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
          notifySuccess('Ação realizada com sucesso!');
        } catch (error) {
          notifyError(error.response?.data?.message || 'Erro ao executar a ação.');
        }
      }
      this.cancelarAcao();
      await this.fetchProfissionais();
    },

    async suspenderUsuario(id) {
      const token = sessionStorage.getItem('token');
      return axios.put(
        `/api/usuarios/${id}/suspender`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },

    async habilitarUsuario(id) {
      const token = sessionStorage.getItem('token');
      return axios.put(
        `/api/usuarios/${id}/habilitar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },

    async excluirUsuario(id) {
      const token = sessionStorage.getItem('token');
      return axios.delete(`/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },
};
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  padding: 1.5rem 1rem 2rem;
}

.admin-shell-card {
  border-color: rgba(255, 255, 255, 0.1);
}

.admin-intro {
  text-align: center;
}

.admin-tabs {
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 0 0.25rem;
}

.admin-nav-card {
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.admin-nav-card:hover {
  transform: translateY(-2px);
  border-color: rgba(139, 92, 246, 0.28);
}

.admin-card-subtitle {
  margin-top: 0.5rem;
  color: #cbd5e1;
  opacity: 1;
}

.admin-mobile-user-name {
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
}

.admin-mobile-user-meta {
  margin: 0.3rem 0 0;
  color: #94a3b8;
  font-size: 0.92rem;
}

.admin-table :deep(table) {
  background: rgba(15, 23, 42, 0.4);
  border-radius: 1rem;
}

.admin-table :deep(th) {
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 700;
}

.admin-table :deep(td) {
  color: #e2e8f0;
}

.admin-table-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (min-width: 600px) {
  .admin-page {
    padding-inline: 1.5rem;
  }
}

@media (min-width: 960px) {
  .admin-page {
    padding-inline: 2rem;
  }

  .admin-intro {
    text-align: left;
  }
}
</style>

<template>
  <LayoutProfissional>
    <div class="app-shell profile-shell">
      <div class="page-wrap profile-stack">
        <AppPanel title="Perfil" subtitle="Veja ou atualize seus dados profissionais." />

        <v-progress-linear
          v-if="loading"
          indeterminate
          color="primary"
          rounded
          class="profile-loading"
        />

        <v-alert v-if="errorMessage" type="error" variant="tonal" rounded="xl" class="profile-alert">
          {{ errorMessage }}
        </v-alert>

        <AppPanel>
          <v-form @submit.prevent="updateUser">
            <v-row dense>
              <v-col cols="12" md="6">
                <AppField v-model="user.nome_usuario" label="Nome" required />
              </v-col>

              <v-col cols="12" md="6">
                <AppField v-model="user.email" label="Email" type="email" required />
              </v-col>

              <v-col cols="12" md="6">
                <AppField v-model="user.telefone" label="Telefone" type="tel" />
              </v-col>

              <v-col cols="12" md="6">
                <AppField v-model="newPassword" label="Nova senha" type="password" />
              </v-col>

              <v-col cols="12">
                <div class="profile-actions">
                  <AppButton variant="danger" @click="openDeleteModal">
                    Deletar Conta
                  </AppButton>

                  <AppButton type="submit">
                    Salvar Alteracoes
                  </AppButton>
                </div>
              </v-col>
            </v-row>
          </v-form>

          <div v-if="user.profileLink" class="profile-link-block">
            <p class="profile-link-label">
              Seu link de perfil:
            </p>
            <a :href="user.profileLink" target="_blank" class="profile-link-anchor">
              {{ user.profileLink }}
            </a>
          </div>
        </AppPanel>

        <AppConfirmDialog
          v-model="showDeleteModal"
          title="Confirmar Exclusao"
          message="Tem certeza que deseja deletar sua conta? Essa acao e irreversivel."
          confirm-text="Deletar Conta"
          cancel-text="Cancelar"
          confirm-variant="danger"
          @confirm="handleDeleteAccount"
        />
      </div>
    </div>
  </LayoutProfissional>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import LayoutProfissional from '@/components/LayoutProfissional.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue';
import AppField from '@/components/ui/AppField.vue';
import AppPanel from '@/components/ui/AppPanel.vue';
import { notifyError, notifySuccess } from '@/utils/feedback.js';

const router = useRouter();
const user = ref({});
const newPassword = ref('');
const loading = ref(true);
const errorMessage = ref('');
const showDeleteModal = ref(false);

const fetchUser = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const token = sessionStorage.getItem('token');
    if (!token) throw new Error('No token');

    const response = await axios.get('/api/usuarios/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    user.value = response.data;
    sessionStorage.setItem('user', JSON.stringify(user.value));
  } catch (error) {
    console.error('Erro ao carregar perfil:', error);
    errorMessage.value = 'Erro ao carregar dados. Tente logar novamente.';

    if (error.response?.status === 401 || error.response?.status === 403) {
      sessionStorage.clear();
      localStorage.removeItem('blade_persistent_auth');
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
      nova_senha: newPassword.value || undefined,
    };

    const response = await axios.put('/api/usuarios/me', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    user.value = response.data;
    sessionStorage.setItem('user', JSON.stringify(user.value));
    notifySuccess('Perfil atualizado com sucesso!');
    await fetchUser();
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    notifyError(error.response?.data?.message || 'Erro ao atualizar perfil.');
  }
};

const openDeleteModal = () => {
  showDeleteModal.value = true;
};

const handleDeleteAccount = async () => {
  try {
    const token = sessionStorage.getItem('token');
    await axios.delete('/api/usuarios/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    notifySuccess('Conta deletada!');
    sessionStorage.clear();
    localStorage.removeItem('blade_persistent_auth');
    router.push('/register');
  } catch (error) {
    notifyError(error.response?.data?.message || 'Erro ao deletar conta.');
  } finally {
    showDeleteModal.value = false;
  }
};

onMounted(() => {
  const savedUser = sessionStorage.getItem('user');

  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser);
    } catch (error) {
      console.warn('Conteudo de sessionStorage `user` invalido:', error);
      sessionStorage.removeItem('user');
    }
  }

  fetchUser();
});
</script>

<style scoped>
.profile-shell {
  padding: 1.5rem 1rem 2rem;
}

.profile-stack {
  display: grid;
  gap: 1.5rem;
}

.profile-loading {
  border-radius: 999px;
}

.profile-alert {
  background: rgba(127, 29, 29, 0.22) !important;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.5rem;
}

.profile-link-block {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.16);
}

.profile-link-label {
  margin: 0 0 0.5rem;
  color: #94a3b8;
  font-size: 0.92rem;
}

.profile-link-anchor {
  color: #c084fc;
  word-break: break-word;
}

@media (min-width: 700px) {
  .profile-actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>

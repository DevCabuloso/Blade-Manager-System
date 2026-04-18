<template>
  <AppPanel
    title="Gestao de Barbearias"
    subtitle="Use a busca, acompanhe a listagem e mantenha o cadastro com uma experiencia administrativa mais consistente."
  >
    <v-alert
      v-if="feedbackMessage"
      :type="feedbackType"
      variant="tonal"
      density="comfortable"
      class="mb-5"
    >
      {{ feedbackMessage }}
    </v-alert>

    <v-form ref="barbeariaForm" @submit.prevent="buscarBarbearias">
      <v-row dense class="mb-2">
        <v-col cols="12" lg="8">
          <AppField
            v-model="filtroNome"
            label="Buscar por nome"
            placeholder="Digite o nome da barbearia"
            :disabled="isLoading"
            clearable
          />
        </v-col>
        <v-col cols="12" sm="6" lg="2">
          <AppButton color="info" variant="primary" block :loading="isLoading" type="submit">
            Buscar
          </AppButton>
        </v-col>
        <v-col cols="12" sm="6" lg="2">
          <AppButton color="success" variant="primary" block @click="abrirModal()">
            + Adicionar
          </AppButton>
        </v-col>
      </v-row>
    </v-form>

    <v-table class="d-none d-md-block admin-table" theme="dark">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Telefone</th>
          <th class="text-right">Acoes</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="barbearia in barbearias" :key="barbearia.id">
          <td>{{ barbearia.id }}</td>
          <td>{{ barbearia.nome_usuario }}</td>
          <td>{{ barbearia.email }}</td>
          <td>{{ barbearia.telefone || '-' }}</td>
          <td>
            <div class="barbershop-table-actions">
              <AppButton color="warning" variant="primary" size="small" @click="editarBarbearia(barbearia)">
                Editar
              </AppButton>
              <AppButton variant="danger" size="small" @click="confirmarExclusao(barbearia)">
                Excluir
              </AppButton>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>

    <div v-if="barbearias.length === 0" class="mt-4">
      <AppEmptyState
        title="Nenhuma barbearia encontrada"
        message="Ajuste o filtro ou cadastre uma nova barbearia para comecar."
      />
    </div>

    <div class="d-flex flex-column ga-3 d-md-none">
      <v-card
        v-for="barbearia in barbearias"
        :key="`mobile-${barbearia.id}`"
        rounded="xl"
        color="rgba(15, 23, 42, 0.72)"
        border
      >
        <v-card-text>
          <div class="d-flex align-start justify-space-between ga-3">
            <div>
              <p class="barbershop-mobile-id">ID {{ barbearia.id }}</p>
              <h2 class="barbershop-mobile-name">{{ barbearia.nome_usuario }}</h2>
              <p class="barbershop-mobile-meta">{{ barbearia.email }}</p>
              <p class="barbershop-mobile-meta">{{ barbearia.telefone || '-' }}</p>
            </div>
          </div>

          <div class="d-flex flex-column ga-2 mt-4">
            <AppButton color="warning" variant="primary" block @click="editarBarbearia(barbearia)">
              Editar
            </AppButton>
            <AppButton variant="danger" block @click="confirmarExclusao(barbearia)">
              Excluir
            </AppButton>
          </div>
        </v-card-text>
      </v-card>

      <AppEmptyState
        v-if="barbearias.length === 0"
        title="Nenhuma barbearia encontrada"
        message="Ajuste o filtro ou cadastre uma nova barbearia para comecar."
      />
    </div>

    <AppDialog
      v-model="showModal"
      :title="editando ? 'Editar Barbearia' : 'Cadastrar Barbearia'"
      :subtitle="editando ? 'Atualize apenas os dados necessarios.' : 'Preencha os dados para criar uma nova barbearia.'"
      max-width="640"
    >
      <v-alert
        v-if="modalError"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mb-4"
      >
        {{ modalError }}
      </v-alert>

      <v-form ref="modalForm" @submit.prevent="salvarBarbearia">
        <div class="barbershop-form">
          <AppField v-model="form.nome_usuario" label="Nome" :rules="nameRules" :disabled="isSaving" />
          <AppField v-model="form.email" label="E-mail" type="email" :rules="emailRules" :disabled="isSaving" />
          <AppField
            v-if="!editando"
            v-model="form.senha"
            label="Senha"
            type="password"
            :rules="passwordRules"
            :disabled="isSaving"
          />
          <AppField v-model="form.telefone" label="Telefone" :disabled="isSaving" />
        </div>
      </v-form>

      <template #actions>
        <AppButton variant="secondary" :disabled="isSaving" @click="fecharModal">
          Cancelar
        </AppButton>
        <AppButton color="success" variant="primary" :loading="isSaving" @click="salvarBarbearia">
          {{ editando ? 'Atualizar' : 'Cadastrar' }}
        </AppButton>
      </template>
    </AppDialog>

    <AppConfirmDialog
      v-model="showDeleteModal"
      title="Excluir Barbearia"
      :message="deleteMessage"
      confirm-text="Excluir"
      :loading="isDeleting"
      @confirm="excluirBarbeariaConfirmada"
      @cancel="resetDeleteState"
    />
  </AppPanel>
</template>

<script>
import axios from 'axios';
import AppButton from '@/components/ui/AppButton.vue';
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppEmptyState from '@/components/ui/AppEmptyState.vue';
import AppField from '@/components/ui/AppField.vue';
import AppPanel from '@/components/ui/AppPanel.vue';
import { notifyError, notifySuccess } from '@/utils/feedback.js';

const emptyForm = () => ({
  id: null,
  nome_usuario: '',
  email: '',
  senha: '',
  telefone: '',
});

export default {
  components: {
    AppButton,
    AppConfirmDialog,
    AppDialog,
    AppEmptyState,
    AppField,
    AppPanel,
  },
  data() {
    return {
      barbearias: [],
      filtroNome: '',
      showModal: false,
      showDeleteModal: false,
      editando: false,
      barbeariaParaExcluir: null,
      deleteMessage: 'Deseja realmente excluir essa barbearia?',
      form: emptyForm(),
      token: sessionStorage.getItem('token'),
      isLoading: false,
      isSaving: false,
      isDeleting: false,
      feedbackMessage: '',
      feedbackType: 'info',
      modalError: '',
      nameRules: [
        (value) => Boolean(String(value || '').trim()) || 'Informe o nome da barbearia.',
      ],
      emailRules: [
        (value) => Boolean(String(value || '').trim()) || 'Informe o e-mail.',
        (value) => /.+@.+\..+/.test(String(value || '').trim()) || 'Informe um e-mail valido.',
      ],
      passwordRules: [
        (value) => this.editando || Boolean(String(value || '').trim()) || 'Informe a senha.',
      ],
    };
  },
  mounted() {
    this.buscarBarbearias();
  },
  methods: {
    setFeedback(message = '', type = 'info') {
      this.feedbackMessage = message;
      this.feedbackType = type;
    },

    async buscarBarbearias() {
      this.isLoading = true;
      this.setFeedback();

      try {
        const { data } = await axios.get('/api/usuarios/profissionais/all', {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.barbearias = this.filtroNome
          ? data.filter((b) => b.nome_usuario.toLowerCase().includes(this.filtroNome.toLowerCase()))
          : data;
      } catch (err) {
        console.error(err);
        this.barbearias = [];
        this.setFeedback('Erro ao buscar barbearias.', 'error');
        notifyError('Erro ao buscar barbearias.');
      } finally {
        this.isLoading = false;
      }
    },

    abrirModal(barbearia = null) {
      this.modalError = '';
      if (barbearia) {
        this.editando = true;
        this.form = { ...barbearia, senha: '' };
      } else {
        this.editando = false;
        this.form = emptyForm();
      }
      this.showModal = true;
    },

    fecharModal() {
      this.showModal = false;
      this.modalError = '';
      this.form = emptyForm();
      this.editando = false;
    },

    editarBarbearia(barbearia) {
      this.abrirModal(barbearia);
    },

    confirmarExclusao(barbearia) {
      this.barbeariaParaExcluir = barbearia;
      this.deleteMessage = `Deseja realmente excluir a barbearia ${barbearia.nome_usuario}?`;
      this.showDeleteModal = true;
    },

    resetDeleteState() {
      this.showDeleteModal = false;
      this.barbeariaParaExcluir = null;
      this.deleteMessage = 'Deseja realmente excluir essa barbearia?';
    },

    async excluirBarbeariaConfirmada() {
      if (!this.barbeariaParaExcluir) return;

      this.isDeleting = true;

      try {
        await axios.delete(`/api/usuarios/${this.barbeariaParaExcluir.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.setFeedback('Barbearia excluida com sucesso.', 'success');
        notifySuccess('Barbearia excluida!');
        await this.buscarBarbearias();
      } catch (err) {
        console.error(err);
        this.setFeedback('Erro ao excluir barbearia.', 'error');
        notifyError('Erro ao excluir barbearia.');
      } finally {
        this.isDeleting = false;
        this.resetDeleteState();
      }
    },

    async salvarBarbearia() {
      this.modalError = '';

      const validation = await this.$refs.modalForm?.validate();
      if (validation && !validation.valid) {
        return;
      }

      this.isSaving = true;

      try {
        if (this.editando) {
          await axios.put(
            `/api/usuarios/${this.form.id}`,
            {
              nome_usuario: this.form.nome_usuario,
              email: this.form.email,
              telefone: this.form.telefone,
            },
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
          this.setFeedback('Barbearia atualizada com sucesso.', 'success');
          notifySuccess('Barbearia atualizada!');
        } else {
          await axios.post(
            '/api/usuarios',
            {
              nome_usuario: this.form.nome_usuario,
              email: this.form.email,
              senha: this.form.senha,
              telefone: this.form.telefone,
              tipo_usuario: 'barbeiro',
            },
            { headers: { Authorization: `Bearer ${this.token}` } }
          );
          this.setFeedback('Barbearia cadastrada com sucesso.', 'success');
          notifySuccess('Barbearia cadastrada!');
        }

        this.fecharModal();
        await this.buscarBarbearias();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || 'Erro ao salvar barbearia.';
        this.modalError = msg;
        notifyError(msg);
      } finally {
        this.isSaving = false;
      }
    },
  },
};
</script>

<style scoped>
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

.barbershop-form {
  display: grid;
  gap: 1rem;
}

.barbershop-table-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.barbershop-mobile-id {
  margin: 0;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.barbershop-mobile-name {
  margin: 0.5rem 0 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
}

.barbershop-mobile-meta {
  margin: 0.3rem 0 0;
  color: #94a3b8;
  font-size: 0.92rem;
}
</style>

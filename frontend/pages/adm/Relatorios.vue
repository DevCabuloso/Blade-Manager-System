<template>
  <AppPanel
    title="Relatorios por Profissional"
    subtitle="Busque um profissional para visualizar os indicadores administrativos sem sair do fluxo atual."
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

    <v-form @submit.prevent="buscarStats">
      <v-row dense class="mb-2">
        <v-col cols="12" lg="8">
          <AppField
            v-model="filtroProfissional"
            label="Profissional"
            placeholder="Digite nome ou e-mail do profissional"
            :disabled="isLoading"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="2">
          <AppField
            v-model="filtroPeriodo"
            label="Periodo"
            field-type="select"
            :items="periodOptions"
            item-title="label"
            item-value="value"
            :disabled="isLoading"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="2">
          <AppButton type="submit" block :loading="isLoading">
            Buscar
          </AppButton>
        </v-col>
      </v-row>
    </v-form>

    <v-row v-if="profissionalEncontrado" dense class="mt-2">
      <v-col
        v-for="card in statCards"
        :key="card.key"
        cols="12"
        sm="6"
        xl="3"
      >
        <v-card rounded="xl" color="rgba(15, 23, 42, 0.72)" border class="h-100">
          <v-card-text class="text-center">
            <div class="reports-card-label">{{ card.label }}</div>
            <div class="mt-3 text-3xl font-bold text-white">{{ stats[card.key] }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-sheet
      v-else
      rounded="xl"
      border
      color="rgba(15, 23, 42, 0.45)"
      class="mt-4 reports-empty-state"
    >
      Digite um profissional e clique em "Buscar" para ver os relatorios.
    </v-sheet>

    <div
      v-if="profissionalEncontrado"
      class="d-flex flex-column flex-sm-row align-sm-center justify-sm-space-between ga-3 mt-5"
    >
      <v-chip color="primary" variant="tonal" size="small">
        Periodo atual: {{ periodLabel }}
      </v-chip>

      <AppButton color="success" variant="primary" @click="exportarPDF">
        Exportar PDF
      </AppButton>
    </div>
  </AppPanel>
</template>

<script setup>
import { computed, ref } from 'vue';
import axios from 'axios';
import AppButton from '@/components/ui/AppButton.vue';
import AppField from '@/components/ui/AppField.vue';
import AppPanel from '@/components/ui/AppPanel.vue';
import { notifyError, notifyInfo } from '@/utils/feedback.js';

const filtroProfissional = ref('');
const filtroPeriodo = ref('mes');
const stats = ref({
  usuarios: 0,
  barbearias: 0,
  agendamentos: 0,
  servicos: 0,
});
const profissionalEncontrado = ref(false);
const feedbackMessage = ref('');
const feedbackType = ref('info');
const isLoading = ref(false);

const token = sessionStorage.getItem('token');

const periodOptions = [
  { label: 'Dia', value: 'dia' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mes', value: 'mes' },
  { label: 'Personalizado', value: 'custom' },
];

const statCards = [
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'barbearias', label: 'Barbearias' },
  { key: 'agendamentos', label: 'Agendamentos' },
  { key: 'servicos', label: 'Servicos' },
];

const periodLabel = computed(() => {
  return periodOptions.find((item) => item.value === filtroPeriodo.value)?.label || filtroPeriodo.value;
});

const setFeedback = (message = '', type = 'info') => {
  feedbackMessage.value = message;
  feedbackType.value = type;
};

const buscarStats = async () => {
  if (!filtroProfissional.value.trim()) {
    const message = 'Digite o nome ou e-mail do profissional!';
    setFeedback(message, 'warning');
    notifyInfo(message);
    profissionalEncontrado.value = false;
    return;
  }

  isLoading.value = true;
  setFeedback();

  try {
    const { data } = await axios.get(
      `/api/relatorios?profissional=${filtroProfissional.value}&periodo=${filtroPeriodo.value}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    stats.value = data;
    profissionalEncontrado.value = true;
  } catch (err) {
    console.error(err);
    const message = 'Profissional nao encontrado ou erro ao buscar relatorios.';
    setFeedback(message, 'error');
    notifyError(message);
    profissionalEncontrado.value = false;
  } finally {
    isLoading.value = false;
  }
};

const exportarPDF = () => {
  if (!profissionalEncontrado.value) {
    const message = 'Busque um profissional primeiro!';
    setFeedback(message, 'warning');
    notifyInfo(message);
    return;
  }

  const message = 'A exportacao em PDF ainda depende da implementacao existente.';
  setFeedback(message, 'info');
  notifyInfo(message);
};
</script>

<style scoped>
.reports-empty-state {
  border-color: rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  padding: 1.25rem 1rem;
}

.reports-card-label {
  color: #94a3b8;
  font-size: 0.92rem;
}
</style>

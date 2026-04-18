<template>
  <LayoutProfissional>
    <div class="app-shell horarios-shell">
      <div class="page-wrap horarios-stack">
        <div class="page-panel horarios-header-panel">
          <div class="horarios-header">
            <div class="horarios-header-copy">
              <div>
                <h1 class="page-title horarios-title">Horários de Funcionamento</h1>
                <p class="page-subtitle horarios-subtitle">
                  Defina dias e horários de atendimento. Esses horários aparecem para clientes ao agendar.
                </p>
              </div>
            </div>

            <AppButton block class="horarios-action-button" @click="openCreateModal">
              Novo Horário
            </AppButton>
          </div>
        </div>

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          rounded="xl"
          border="start"
          class="horarios-alert"
        >
          {{ errorMessage }}
        </v-alert>

        <div class="table-shell horarios-table-shell">
          <HorarioList
            :horarios="horariosSorted"
            :loading="loading"
            @edit="openEditModal"
            @delete="openDeleteModal"
          />
        </div>

        <HorarioFormModal
          v-model="showModal"
          :title="editingId ? 'Editar Horário' : 'Novo Horário'"
          :initial-value="formData"
          @submit="salvarHorario"
        />

        <AppConfirmDialog
          v-model="showDeleteModal"
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este horário?"
          confirm-text="Deletar"
          cancel-text="Cancelar"
          confirm-variant="danger"
          @confirm="deletarHorario"
          @cancel="closeDeleteModal"
        />
      </div>
    </div>
  </LayoutProfissional>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import LayoutProfissional from '@/components/LayoutProfissional.vue';
import HorarioFormModal from '@/components/professional/HorarioFormModal.vue';
import HorarioList from '@/components/professional/HorarioList.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue';
import { useHorarios } from '@/composables/useHorarios.js';

const router = useRouter();
const { horariosSorted, loading, errorMessage, fetchHorarios, saveHorario, deleteHorario } = useHorarios({ router });

const showModal = ref(false);
const showDeleteModal = ref(false);
const editingId = ref(null);
const deletingId = ref(null);

const createEmptyHorario = () => ({
  dia_semana: '',
  hora_abertura: '',
  hora_fechamento: '',
});

const formData = ref(createEmptyHorario());

const openCreateModal = () => {
  editingId.value = null;
  formData.value = createEmptyHorario();
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

const salvarHorario = async (payload) => {
  const saved = await saveHorario({
    id: editingId.value,
    data: payload,
  });

  if (saved) {
    showModal.value = false;
    editingId.value = null;
  }
};

const openDeleteModal = (id) => {
  deletingId.value = id;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletingId.value = null;
};

const deletarHorario = async () => {
  const deleted = await deleteHorario(deletingId.value);

  if (deleted) {
    closeDeleteModal();
  }
};

onMounted(() => {
  fetchHorarios();
});
</script>

<style scoped>
.horarios-alert {
  background: rgba(127, 29, 29, 0.22) !important;
}

.horarios-shell {
  padding: 1.5rem 1rem 2rem;
}

.horarios-stack {
  display: grid;
  gap: 1.5rem;
}

.horarios-header-panel,
.horarios-table-shell {
  padding: 1.25rem;
}

.horarios-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.horarios-header-copy {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.horarios-title {
  font-size: clamp(1.8rem, 2.6vw, 2.6rem);
}

.horarios-subtitle {
  margin-top: 0.5rem;
}

.horarios-action-button {
  width: 100%;
}

@media (min-width: 960px) {
  .horarios-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .horarios-header-panel,
  .horarios-table-shell {
    padding: 1.5rem;
  }

  .horarios-action-button {
    width: auto;
    min-width: 180px;
  }
}
</style>

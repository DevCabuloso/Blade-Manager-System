<template>
  <LayoutProfissional>
    <div class="app-shell services-shell">
      <div class="page-wrap services-stack">
        <div class="page-panel services-panel">
          <div class="services-header">
            <div>
              <h1 class="page-title">Gerenciamento de Serviços</h1>
              <p class="page-subtitle services-subtitle">Gerencie, edite e organize os serviços oferecidos.</p>
            </div>

            <AppButton :block="isMobile" size="small" class="services-add-button" @click="openCreateModal">
              + Novo Serviço
            </AppButton>
          </div>
        </div>

        <div class="table-shell services-table-shell">
          <ServiceList
            :services="services"
            :is-loading="isLoading"
            @edit="openEditModal"
            @delete="openDeleteModal"
          />
        </div>

        <ServiceFormModal
          v-model="showCreateModal"
          title="Novo Serviço"
          submit-text="Salvar"
          :initial-value="newService"
          @submit="handleCreate"
        />

        <ServiceFormModal
          v-model="showEditModal"
          title="Editar Serviço"
          submit-text="Atualizar"
          :initial-value="editService"
          @submit="handleUpdate"
        />

        <AppConfirmDialog
          v-model="showDeleteModal"
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir este serviço?"
          confirm-text="Excluir"
          cancel-text="Cancelar"
          confirm-variant="danger"
          @confirm="handleDelete"
          @cancel="closeDeleteModal"
        />
      </div>
    </div>
  </LayoutProfissional>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDisplay } from 'vuetify';
import LayoutProfissional from '@/components/LayoutProfissional.vue';
import ServiceFormModal from '@/components/professional/ServiceFormModal.vue';
import ServiceList from '@/components/professional/ServiceList.vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue';
import { useServices } from '@/composables/useServices.js';
import { notifyError } from '@/utils/feedback.js';

const router = useRouter();
const { mdAndDown } = useDisplay();
const isMobile = mdAndDown;
const { services, isLoading, fetchServices, createService, updateService, deleteService } = useServices({ router });

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const deleteServiceId = ref(null);

const createEmptyService = () => ({
  name: '',
  duration: '',
  price: 0,
  priceMasked: '',
});

const newService = ref(createEmptyService());
const editService = ref({
  id: '',
  ...createEmptyService(),
});

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const openCreateModal = () => {
  newService.value = createEmptyService();
  showCreateModal.value = true;
};

const openEditModal = (service) => {
  const amount = Number(service.preco) || 0;

  editService.value = {
    id: service.id,
    name: service.nome,
    duration: service.duracao_minutos,
    price: amount,
    priceMasked: amount ? formatCurrency(amount) : '',
  };
  showEditModal.value = true;
};

const openDeleteModal = (id) => {
  deleteServiceId.value = id;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deleteServiceId.value = null;
};

const handleCreate = async (payload) => {
  if (!payload.name || !payload.price || !payload.duration) {
    notifyError('Preencha todos os campos obrigatorios.');
    return;
  }

  const created = await createService(payload);
  if (created) {
    showCreateModal.value = false;
  }
};

const handleUpdate = async (payload) => {
  const updated = await updateService(editService.value.id, payload);
  if (updated) {
    showEditModal.value = false;
  }
};

const handleDelete = async () => {
  const deleted = await deleteService(deleteServiceId.value);
  if (deleted) {
    closeDeleteModal();
  }
};

onMounted(async () => {
  await fetchServices();
});
</script>

<style scoped>
.services-shell {
  padding: 1.5rem 1rem 2rem;
}

.services-stack {
  display: grid;
  gap: 1.5rem;
}

.services-panel,
.services-table-shell {
  padding: 1.5rem;
}

.services-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.services-subtitle {
  margin-top: 0.5rem;
}

.services-add-button {
  width: 100%;
}

@media (min-width: 960px) {
  .services-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .services-add-button {
    width: auto;
    min-width: 0;
    min-height: 36px;
    padding-inline: 0.75rem;
  }
}
</style>

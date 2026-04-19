<template>
  <div v-if="isLoading" class="service-list__state">
    <v-progress-circular indeterminate color="primary" size="32" width="3" />
    <span>Carregando serviços...</span>
  </div>
  <div v-else-if="services.length" class="service-list">
    <div class="service-list__table-wrap">
      <v-table class="service-list__table" density="comfortable">
        <thead>
          <tr>
            <th>Nome</th>
            <th>{{ isMobile ? 'Preço' : 'Preço' }}</th>
            <th>{{ isMobile ? 'Dur.' : 'Duração' }}</th>
            <th class="text-right">{{ isMobile ? 'Ações' : 'Ações' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>{{ service.nome }}</td>
            <td>{{ formatCurrency(service.preco) }}</td>
            <td>{{ service.duracao_minutos }} min</td>
            <td>
              <div class="service-list__actions service-list__actions--table">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  class="service-list__icon-button"
                  @click="$emit('edit', service)"
                />
                <v-btn
                  icon="mdi-trash-can-outline"
                  size="small"
                  variant="text"
                  color="error"
                  class="service-list__icon-button service-list__icon-button--danger"
                  @click="$emit('delete', service.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
  <AppEmptyState
    v-else
    icon="✂"
    title="Nenhum serviço encontrado"
    message="Crie um novo serviço para começar a organizar seus atendimentos."
  />
</template>

<script setup>
import { useDisplay } from 'vuetify';
import AppEmptyState from '@/components/ui/AppEmptyState.vue';

const { smAndDown } = useDisplay();
const isMobile = smAndDown;

defineProps({
  services: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['edit', 'delete']);

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};
</script>

<style scoped>
.service-list__state {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #c4b5fd;
}

.service-list__table {
  width: 100%;
  background: rgba(2, 6, 23, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  overflow: hidden;
  table-layout: fixed;
}

.service-list__table-wrap {
  width: 100%;
}

.service-list__table :deep(th) {
  color: #c4b5fd;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: rgba(31, 41, 55, 0.94);
}

.service-list__table :deep(td) {
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.08);
  vertical-align: middle;
}

.service-list__table :deep(tr:hover td) {
  background: rgba(109, 40, 217, 0.08);
}

.service-list__actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: nowrap;
}

.service-list__actions--table {
  justify-content: flex-end;
  align-items: center;
}

.service-list__icon-button {
  color: #c084fc !important;
}

.service-list__icon-button--danger {
  color: #f472b6 !important;
}

.service-list__table :deep(th:nth-child(1)),
.service-list__table :deep(td:nth-child(1)) {
  width: 36%;
}

.service-list__table :deep(th:nth-child(2)),
.service-list__table :deep(td:nth-child(2)) {
  width: 18%;
}

.service-list__table :deep(th:nth-child(3)),
.service-list__table :deep(td:nth-child(3)) {
  width: 16%;
}

.service-list__table :deep(th:nth-child(4)),
.service-list__table :deep(td:nth-child(4)) {
  width: 30%;
}

@media (max-width: 767px) {
  .service-list__table {
    font-size: 0.82rem;
  }

  .service-list__table :deep(th),
  .service-list__table :deep(td) {
    padding: 0.55rem 0.45rem;
  }

  .service-list__table :deep(th) {
    font-size: 0.68rem;
  }

  .service-list__table :deep(td:nth-child(1)) {
    word-break: break-word;
  }

  .service-list__actions--table {
    gap: 0.1rem;
  }
}
</style>

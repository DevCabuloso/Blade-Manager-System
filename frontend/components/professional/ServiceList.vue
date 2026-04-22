<template>
  <div v-if="isLoading" class="service-list__state">
    <v-progress-circular indeterminate color="primary" size="32" width="3" />
    <span>Carregando serviços...</span>
  </div>
  <div v-else-if="services.length" class="service-list">
    <div v-if="!isMobile" class="service-list__table-wrap">
      <v-table class="service-list__table" density="comfortable">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Preço</th>
            <th>Duração</th>
            <th class="text-right">Ações</th>
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

    <div v-else class="service-list__cards">
      <article v-for="service in services" :key="service.id" class="service-list__card">
        <button
          type="button"
          class="service-list__card-header service-list__card-toggle"
          :aria-expanded="expandedServiceId === service.id"
          @click="toggleService(service.id)"
        >
          <h3 class="service-list__card-title">{{ service.nome }}</h3>
          <v-icon
            icon="mdi-chevron-down"
            size="20"
            class="service-list__card-chevron"
            :class="{ 'service-list__card-chevron--open': expandedServiceId === service.id }"
          />
        </button>

        <v-expand-transition>
          <div v-if="expandedServiceId === service.id" class="service-list__card-content">
            <div class="service-list__card-details">
              <div class="service-list__card-detail">
                <span class="service-list__card-label">Duração</span>
                <span class="service-list__card-value">{{ service.duracao_minutos }} min</span>
              </div>
            </div>

            <div class="service-list__actions service-list__actions--card">
              <v-menu location="bottom end">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    append-icon="mdi-chevron-down"
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="service-list__card-button"
                  >
                    Ações
                  </v-btn>
                </template>

                <v-list class="service-list__menu" bg-color="rgba(15, 23, 42, 0.98)">
                  <v-list-item
                    prepend-icon="mdi-pencil-outline"
                    title="Editar"
                    @click="$emit('edit', service)"
                  />
                  <v-list-item
                    prepend-icon="mdi-trash-can-outline"
                    title="Excluir"
                    class="service-list__menu-item--danger"
                    @click="$emit('delete', service.id)"
                  />
                </v-list>
              </v-menu>
            </div>
          </div>
        </v-expand-transition>
      </article>
    </div>
  </div>
  <AppEmptyState
    v-else
    icon="C"
    title="Nenhum serviço encontrado"
    message="Crie um novo serviço para começar a organizar seus atendimentos."
  />
</template>

<script setup>
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import AppEmptyState from '@/components/ui/AppEmptyState.vue';

const { smAndDown } = useDisplay();
const isMobile = smAndDown;
const expandedServiceId = ref(null);

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

const toggleService = (serviceId) => {
  expandedServiceId.value = expandedServiceId.value === serviceId ? null : serviceId;
};

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

.service-list__table-wrap {
  width: 100%;
}

.service-list__table {
  width: 100%;
  background: rgba(2, 6, 23, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  overflow: hidden;
  table-layout: fixed;
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

.service-list__cards {
  display: grid;
  gap: 0.9rem;
}

.service-list__card {
  padding: 1rem;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.94), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  box-shadow: 0 18px 36px rgba(2, 6, 23, 0.2);
}

.service-list__card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.service-list__card-toggle {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.service-list__card-title {
  margin: 0;
  color: #f5f3ff;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.service-list__card-chevron {
  color: #c4b5fd;
  transition: transform 0.2s ease;
}

.service-list__card-chevron--open {
  transform: rotate(180deg);
}

.service-list__card-content {
  margin-top: 0.9rem;
}

.service-list__card-details {
  margin-top: 0.9rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.service-list__card-detail {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(196, 181, 253, 0.12);
  border-radius: 0.85rem;
}

.service-list__card-label {
  color: #a78bfa;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.service-list__card-value {
  color: #e5e7eb;
  font-size: 0.95rem;
  font-weight: 700;
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

.service-list__actions--card {
  margin-top: 1rem;
  gap: 0.6rem;
}

.service-list__icon-button {
  color: #c084fc !important;
}

.service-list__icon-button--danger {
  color: #ef4444 !important;
}

.service-list__menu {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.9rem;
  overflow: hidden;
}

.service-list__menu :deep(.v-list-item-title) {
  color: #e5e7eb;
  font-weight: 600;
}

.service-list__menu-item--danger :deep(.v-list-item-title),
.service-list__menu-item--danger :deep(.v-icon) {
  color: #fca5a5 !important;
}

.service-list__card-button[color='error'] {
  background: rgba(127, 29, 29, 0.2) !important;
  color: #fca5a5 !important;
}

.service-list__card-button {
  flex: 1 1 0;
}

@media (max-width: 767px) {
  .service-list__card {
    padding: 0.9rem;
  }

  .service-list__card-details {
    grid-template-columns: 1fr;
  }

  .service-list__actions--card {
    justify-content: stretch;
  }

  .service-list__card-button {
    width: 100%;
  }
}
</style>

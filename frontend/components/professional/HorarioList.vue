<template>
  <div v-if="loading" class="horario-list__state">
    <v-progress-circular indeterminate color="primary" size="32" width="3" />
    <span>Carregando horarios...</span>
  </div>
  <div v-else-if="horarios.length" class="horario-list">
    <div v-if="!isMobile" class="horario-list__table-wrap">
      <v-table class="horario-list__table" density="comfortable">
        <thead>
          <tr>
            <th>Dia</th>
            <th>Abertura</th>
            <th>Fechamento</th>
            <th class="text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="horario in horarios" :key="horario.id">
            <td>{{ formatarDiaSemana(horario.dia_semana) }}</td>
            <td>{{ formatarHora(horario.hora_abertura) }}</td>
            <td>{{ formatarHora(horario.hora_fechamento) }}</td>
            <td>
              <div class="horario-list__actions horario-list__actions--table">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  class="horario-list__icon-button"
                  @click="$emit('edit', horario)"
                />
                <v-btn
                  icon="mdi-trash-can-outline"
                  size="small"
                  variant="text"
                  color="error"
                  class="horario-list__icon-button horario-list__icon-button--danger"
                  @click="$emit('delete', horario.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <div v-else class="horario-list__cards">
      <article v-for="horario in horarios" :key="horario.id" class="horario-list__card">
        <button
          type="button"
          class="horario-list__card-header horario-list__card-toggle"
          :aria-expanded="expandedHorarioId === horario.id"
          @click="toggleHorario(horario.id)"
        >
          <h3 class="horario-list__card-title">{{ formatarDiaSemana(horario.dia_semana) }}</h3>
          <v-icon
            icon="mdi-chevron-down"
            size="20"
            class="horario-list__card-chevron"
            :class="{ 'horario-list__card-chevron--open': expandedHorarioId === horario.id }"
          />
        </button>

        <v-expand-transition>
          <div v-if="expandedHorarioId === horario.id" class="horario-list__card-content">
            <div class="horario-list__card-details">
              <div class="horario-list__card-detail">
                <span class="horario-list__card-label">Abertura</span>
                <span class="horario-list__card-value">{{ formatarHora(horario.hora_abertura) }}</span>
              </div>
              <div class="horario-list__card-detail">
                <span class="horario-list__card-label">Fechamento</span>
                <span class="horario-list__card-value">{{ formatarHora(horario.hora_fechamento) }}</span>
              </div>
            </div>

            <div class="horario-list__actions horario-list__actions--card">
              <v-menu location="bottom end">
                <template #activator="{ props: menuProps }">
                  <v-btn
                    v-bind="menuProps"
                    append-icon="mdi-chevron-down"
                    size="small"
                    variant="tonal"
                    color="primary"
                    class="horario-list__card-button"
                  >
                    Ações
                  </v-btn>
                </template>

                <v-list class="horario-list__menu" bg-color="rgba(15, 23, 42, 0.98)">
                  <v-list-item
                    prepend-icon="mdi-pencil-outline"
                    title="Editar"
                    @click="$emit('edit', horario)"
                  />
                  <v-list-item
                    prepend-icon="mdi-trash-can-outline"
                    title="Excluir"
                    class="horario-list__menu-item--danger"
                    @click="$emit('delete', horario.id)"
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
    icon="H"
    title="Nenhum horario cadastrado"
    message='Clique em "Novo Horario" para adicionar os seus dias de atendimento.'
  />
</template>

<script setup>
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import AppEmptyState from '@/components/ui/AppEmptyState.vue';

const { smAndDown } = useDisplay();
const isMobile = smAndDown;
const expandedHorarioId = ref(null);

defineProps({
  horarios: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['edit', 'delete']);

const toggleHorario = (horarioId) => {
  expandedHorarioId.value = expandedHorarioId.value === horarioId ? null : horarioId;
};

const formatarDiaSemana = (dia) => {
  const dias = {
    segunda: 'Segunda-feira',
    terca: 'Terca-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sabado',
    domingo: 'Domingo',
  };

  return dias[dia] || dia;
};

const formatarHora = (hora) => {
  if (!hora) return '-';
  if (hora.length === 5) return hora;
  return hora.substring(0, 5);
};
</script>

<style scoped>
.horario-list__state {
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #c4b5fd;
}

.horario-list__table-wrap {
  width: 100%;
}

.horario-list__table {
  width: 100%;
  background: rgba(2, 6, 23, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  overflow: hidden;
  table-layout: fixed;
}

.horario-list__table :deep(th) {
  color: #9ca3af;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: rgba(15, 23, 42, 0.95);
}

.horario-list__table :deep(td) {
  color: #e5e7eb;
  border-color: rgba(255, 255, 255, 0.08);
  vertical-align: middle;
}

.horario-list__table :deep(tr:hover td) {
  background: rgba(148, 163, 184, 0.06);
}

.horario-list__table :deep(th:nth-child(1)),
.horario-list__table :deep(td:nth-child(1)) {
  width: 36%;
}

.horario-list__table :deep(th:nth-child(2)),
.horario-list__table :deep(td:nth-child(2)),
.horario-list__table :deep(th:nth-child(3)),
.horario-list__table :deep(td:nth-child(3)) {
  width: 17%;
}

.horario-list__table :deep(th:nth-child(4)),
.horario-list__table :deep(td:nth-child(4)) {
  width: 30%;
}

.horario-list__cards {
  display: grid;
  gap: 0.9rem;
}

.horario-list__card {
  padding: 1rem;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.94), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  box-shadow: 0 18px 36px rgba(2, 6, 23, 0.2);
}

.horario-list__card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.horario-list__card-toggle {
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.horario-list__card-title {
  margin: 0;
  color: #f5f3ff;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.horario-list__card-chevron {
  color: #c4b5fd;
  transition: transform 0.2s ease;
}

.horario-list__card-chevron--open {
  transform: rotate(180deg);
}

.horario-list__card-content {
  margin-top: 0.9rem;
}

.horario-list__card-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.horario-list__card-detail {
  display: grid;
  gap: 0.2rem;
  padding: 0.75rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(196, 181, 253, 0.12);
  border-radius: 0.85rem;
}

.horario-list__card-label {
  color: #a78bfa;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.horario-list__card-value {
  color: #e5e7eb;
  font-size: 0.95rem;
  font-weight: 700;
}

.horario-list__actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: nowrap;
}

.horario-list__actions--table {
  justify-content: flex-end;
  align-items: center;
}

.horario-list__actions--card {
  margin-top: 1rem;
  gap: 0.6rem;
}

.horario-list__icon-button {
  color: #c084fc !important;
}

.horario-list__icon-button--danger {
  color: #ef4444 !important;
}

.horario-list__menu {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.9rem;
  overflow: hidden;
}

.horario-list__menu :deep(.v-list-item-title) {
  color: #e5e7eb;
  font-weight: 600;
}

.horario-list__menu-item--danger :deep(.v-list-item-title),
.horario-list__menu-item--danger :deep(.v-icon) {
  color: #fca5a5 !important;
}

.horario-list__card-button {
  flex: 1 1 0;
}

@media (max-width: 767px) {
  .horario-list__card {
    padding: 0.9rem;
  }

  .horario-list__card-details {
    grid-template-columns: 1fr;
  }

  .horario-list__actions--card {
    justify-content: stretch;
  }

  .horario-list__card-button {
    width: 100%;
  }
}
</style>

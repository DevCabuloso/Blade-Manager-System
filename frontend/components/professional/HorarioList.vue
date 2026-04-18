<template>
  <div v-if="loading" class="horario-list__state">
    <v-progress-circular indeterminate color="primary" size="32" width="3" />
    <span>Carregando horários...</span>
  </div>
  <div v-else-if="horarios.length" class="horario-list">
    <div class="horario-list__table-wrap">
      <v-table class="horario-list__table" density="comfortable">
        <thead>
          <tr>
            <th>Dia</th>
            <th>{{ isMobile ? 'Abre' : 'Abertura' }}</th>
            <th>{{ isMobile ? 'Fecha' : 'Fechamento' }}</th>
            <th class="text-right">{{ isMobile ? 'Acoes' : 'Ações' }}</th>
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
  </div>
  <AppEmptyState
    v-else
    icon="⏰"
    title="Nenhum horário cadastrado"
    message='Clique em "Novo Horário" para adicionar os seus dias de atendimento.'
  />
</template>

<script setup>
import { useDisplay } from 'vuetify';
import AppEmptyState from '@/components/ui/AppEmptyState.vue';

const { smAndDown } = useDisplay();
const isMobile = smAndDown;

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

const formatarDiaSemana = (dia) => {
  const dias = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
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

.horario-list__table {
  width: 100%;
  background: rgba(2, 6, 23, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  overflow: hidden;
  table-layout: fixed;
}

.horario-list__table-wrap {
  width: 100%;
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

.horario-list__actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: nowrap;
}

.horario-list__actions--table {
  justify-content: flex-end;
  align-items: center;
}

.horario-list__icon-button {
  color: #c084fc !important;
}

.horario-list__icon-button--danger {
  color: #f472b6 !important;
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

@media (max-width: 767px) {
  .horario-list__table {
    font-size: 0.82rem;
  }

  .horario-list__table :deep(th),
  .horario-list__table :deep(td) {
    padding: 0.55rem 0.45rem;
  }

  .horario-list__table :deep(th) {
    font-size: 0.68rem;
  }

  .horario-list__table :deep(td:nth-child(1)) {
    word-break: break-word;
  }

  .horario-list__actions--table {
    gap: 0.1rem;
  }
}
</style>

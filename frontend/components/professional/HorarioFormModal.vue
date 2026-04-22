<template>
  <AppDialog
    :model-value="modelValue"
    :title="title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form class="horario-form" @submit.prevent="submitForm">
      <AppField
        v-model="form.dia_semana"
        field-type="select"
        label="Dia da Semana"
        :items="diasDaSemana"
        required
      />

      <div class="horario-form__grid">
        <AppField
          v-model="form.hora_abertura"
          label="Hora de Abertura"
          type="time"
          required
        />
        <AppField
          v-model="form.hora_fechamento"
          label="Hora de Fechamento"
          type="time"
          required
        />
      </div>

      <div class="horario-form__actions">
        <AppButton variant="danger" @click="$emit('update:modelValue', false)">
          Cancelar
        </AppButton>
        <AppButton type="submit">Salvar</AppButton>
      </div>
    </form>
  </AppDialog>
</template>

<script setup>
import { reactive, watch } from 'vue';
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppField from '@/components/ui/AppField.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Novo Horário',
  },
  initialValue: {
    type: Object,
    default: () => ({
      dia_semana: '',
      hora_abertura: '',
      hora_fechamento: '',
    }),
  },
});

const emit = defineEmits(['submit', 'update:modelValue']);

const diasDaSemana = [
  { title: 'Segunda-feira', value: 'segunda' },
  { title: 'Terça-feira', value: 'terca' },
  { title: 'Quarta-feira', value: 'quarta' },
  { title: 'Quinta-feira', value: 'quinta' },
  { title: 'Sexta-feira', value: 'sexta' },
  { title: 'Sábado', value: 'sabado' },
  { title: 'Domingo', value: 'domingo' },
];

const createDefaultState = () => ({
  dia_semana: '',
  hora_abertura: '',
  hora_fechamento: '',
});

const form = reactive(createDefaultState());

const syncForm = (value) => {
  Object.assign(form, createDefaultState(), value || {});
};

const submitForm = () => {
  emit('submit', {
    dia_semana: form.dia_semana,
    hora_abertura: form.hora_abertura,
    hora_fechamento: form.hora_fechamento,
  });
};

watch(
  () => [props.initialValue, props.modelValue],
  () => {
    if (props.modelValue) {
      syncForm(props.initialValue);
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.horario-form {
  display: grid;
  gap: 1rem;
}

.horario-form__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.horario-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
}

@media (max-width: 640px) {
  .horario-form__grid {
    grid-template-columns: 1fr;
  }
}
</style>

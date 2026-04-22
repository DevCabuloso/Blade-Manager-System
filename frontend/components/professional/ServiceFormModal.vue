<template>
  <AppDialog
    :model-value="modelValue"
    :title="title"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form class="service-form" @submit.prevent="submitForm">
      <AppField
        v-model="form.name"
        :label="namePlaceholder"
        required
      />
      <AppField
        v-model="form.duration"
        label="Duração (min)"
        type="number"
        required
      />
      <AppField
        v-model="form.priceMasked"
        label="Preço"
        placeholder="R$ 0,00"
        required
        @update:model-value="updatePrice"
      />
      <div class="service-form__actions">
        <AppButton variant="danger" @click="$emit('update:modelValue', false)">
          Cancelar
        </AppButton>
        <AppButton type="submit">
          {{ submitText }}
        </AppButton>
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
    default: 'Novo Serviço',
  },
  submitText: {
    type: String,
    default: 'Salvar',
  },
  initialValue: {
    type: Object,
    default: () => ({
      name: '',
      duration: '',
      price: 0,
      priceMasked: '',
    }),
  },
  namePlaceholder: {
    type: String,
    default: 'Nome do serviço',
  },
});

const emit = defineEmits(['submit', 'update:modelValue']);

const createDefaultState = () => ({
  name: '',
  duration: '',
  price: 0,
  priceMasked: '',
});

const form = reactive(createDefaultState());

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const parseCurrencyToNumber = (rawValue) => {
  const digits = String(rawValue || '').replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits) / 100;
};

const syncForm = (value) => {
  Object.assign(form, createDefaultState(), value || {});
};

const updatePrice = (value) => {
  const amount = parseCurrencyToNumber(value);
  form.price = amount;
  form.priceMasked = amount ? formatCurrency(amount) : '';
};

const submitForm = () => {
  emit('submit', {
    name: form.name,
    duration: form.duration,
    price: form.price,
    priceMasked: form.priceMasked,
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
.service-form {
  display: grid;
  gap: 1rem;
}

.service-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
}
</style>

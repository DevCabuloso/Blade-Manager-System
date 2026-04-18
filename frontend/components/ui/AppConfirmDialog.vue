<template>
  <AppDialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :title="title"
    @update:model-value="handleVisibilityChange"
  >
    <p class="app-confirm__message">{{ message }}</p>

    <template #actions>
      <AppButton variant="secondary" @click="handleCancel">
        {{ cancelText }}
      </AppButton>
      <AppButton :variant="confirmVariant" :loading="loading" @click="$emit('confirm')">
        {{ confirmText }}
      </AppButton>
    </template>
  </AppDialog>
</template>

<script setup>
import AppButton from './AppButton.vue';
import AppDialog from './AppDialog.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Confirmação',
  },
  message: {
    type: String,
    default: '',
  },
  confirmText: {
    type: String,
    default: 'Confirmar',
  },
  cancelText: {
    type: String,
    default: 'Cancelar',
  },
  confirmVariant: {
    type: String,
    default: 'danger',
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: [String, Number],
    default: 460,
  },
});

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const handleCancel = () => {
  emit('cancel');
  emit('update:modelValue', false);
};

const handleVisibilityChange = (value) => {
  emit('update:modelValue', value);
  if (!value && props.modelValue) {
    emit('cancel');
  }
};
</script>

<style scoped>
.app-confirm__message {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.98rem;
  line-height: 1.6;
}
</style>

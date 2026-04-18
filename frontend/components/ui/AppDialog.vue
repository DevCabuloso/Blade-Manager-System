<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="app-dialog" rounded="xl">
      <v-card-title v-if="title || $slots.title" class="app-dialog__title">
        <slot name="title">{{ title }}</slot>
      </v-card-title>

      <v-card-subtitle v-if="subtitle" class="app-dialog__subtitle">
        {{ subtitle }}
      </v-card-subtitle>

      <v-card-text class="app-dialog__content">
        <slot />
      </v-card-text>

      <v-card-actions v-if="$slots.actions" class="app-dialog__actions">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  maxWidth: {
    type: [String, Number],
    default: 560,
  },
  persistent: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update:modelValue']);
</script>

<style scoped>
.app-dialog {
  background: rgba(2, 6, 23, 0.96) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.app-dialog__title {
  padding-bottom: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #f8fafc;
}

.app-dialog__subtitle {
  color: #94a3b8;
  opacity: 1;
}

.app-dialog__content {
  color: #cbd5e1;
}

.app-dialog__actions {
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}
</style>

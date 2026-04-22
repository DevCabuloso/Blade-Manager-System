<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :transition="transition"
    :content-class="contentClass"
    scrollable
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="app-dialog" :style="dialogStyle" rounded="xl">
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
import { computed } from 'vue';

const props = defineProps({
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
    default: 720,
  },
  viewportWidth: {
    type: String,
    default: '92vw',
  },
  persistent: {
    type: Boolean,
    default: false,
  },
  transition: {
    type: String,
    default: 'fade-transition',
  },
  contentClass: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue']);

const dialogStyle = computed(() => {
  const widthValue = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : String(props.maxWidth || '720px');
  const viewportWidthValue = String(props.viewportWidth || '92vw');

  return {
    '--app-dialog-max-width': widthValue,
    '--app-dialog-viewport-width': viewportWidthValue,
  };
});
</script>

<style scoped>
.app-dialog {
  background: rgba(2, 6, 23, 0.96) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #f8fafc;
  width: 100%;
  max-width: 100%;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
}

:deep(.v-overlay__content) {
  width: min(var(--app-dialog-viewport-width, 92vw), var(--app-dialog-max-width, 720px));
  max-width: calc(100vw - 16px) !important;
  margin-inline: auto;
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
  overflow-y: auto;
}

.app-dialog__actions {
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
}

@media (max-width: 640px) {
  :deep(.v-overlay__content) {
    width: min(var(--app-dialog-viewport-width, 94vw), var(--app-dialog-max-width, 720px));
    max-width: calc(100vw - 12px) !important;
  }

  .app-dialog {
    max-height: 90vh;
  }

  .app-dialog__actions {
    padding: 0 1rem 1rem;
  }
}
</style>

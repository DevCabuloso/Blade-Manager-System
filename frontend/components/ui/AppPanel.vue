<template>
  <v-sheet
    :border="border"
    :color="color"
    :elevation="elevation"
    :rounded="rounded"
    class="app-panel"
  >
    <div v-if="$slots.header || title || subtitle" class="app-panel__header">
      <slot name="header">
        <div>
          <h2 v-if="title" class="app-panel__title">{{ title }}</h2>
          <p v-if="subtitle" class="app-panel__subtitle">{{ subtitle }}</p>
        </div>
      </slot>
    </div>

    <div class="app-panel__body">
      <slot />
    </div>

    <div v-if="$slots.actions" class="app-panel__actions">
      <slot name="actions" />
    </div>
  </v-sheet>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'rgba(2, 6, 23, 0.78)',
  },
  elevation: {
    type: [String, Number],
    default: 0,
  },
  rounded: {
    type: String,
    default: 'xl',
  },
  border: {
    type: [Boolean, String],
    default: true,
  },
});
</script>

<style scoped>
.app-panel {
  padding: 1.5rem;
  backdrop-filter: blur(12px);
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.24);
}

.app-panel__header + .app-panel__body {
  margin-top: 1rem;
}

.app-panel__title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.35rem, 2vw, 2rem);
  font-weight: 800;
  line-height: 1.15;
}

.app-panel__subtitle {
  margin: 0.65rem 0 0;
  color: #94a3b8;
  font-size: 0.98rem;
  line-height: 1.5;
}

.app-panel__actions {
  margin-top: 1.5rem;
}
</style>

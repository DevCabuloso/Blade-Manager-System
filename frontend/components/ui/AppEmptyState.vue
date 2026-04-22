<template>
  <v-sheet
    rounded="xl"
    border
    color="rgba(15, 23, 42, 0.7)"
    class="app-empty-state"
  >
    <div v-if="icon" class="app-empty-state__icon" aria-hidden="true">{{ icon }}</div>
    <h3 class="app-empty-state__title">{{ title }}</h3>
    <p v-if="message" class="app-empty-state__message">{{ message }}</p>
    <AppButton v-if="actionLabel" variant="secondary" @click="$emit('action')">
      {{ actionLabel }}
    </AppButton>
  </v-sheet>
</template>

<script setup>
import AppButton from './AppButton.vue';

defineProps({
  icon: {
    type: String,
    default: '•',
  },
  title: {
    type: String,
    default: 'Nada por aqui ainda',
  },
  message: {
    type: String,
    default: '',
  },
  actionLabel: {
    type: String,
    default: '',
  },
});

defineEmits(['action']);
</script>

<style scoped>
.app-empty-state {
  padding: 2rem 1.5rem;
  border-color: rgba(255, 255, 255, 0.1) !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.9rem;
}

.app-empty-state__title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.1rem;
  font-weight: 700;
}

.app-empty-state__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: rgba(148, 163, 184, 0.12);
  color: #cbd5e1;
  font-size: 1.6rem;
  font-weight: 700;
}

.app-empty-state__message {
  margin: 0;
  max-width: 30rem;
  color: #94a3b8;
  line-height: 1.55;
}
</style>

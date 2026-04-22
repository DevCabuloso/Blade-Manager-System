<template>
  <v-app class="app-shell">
    <v-main class="app-main">
      <router-view />
    </v-main>
  </v-app>

  <Transition name="fade-loader">
    <div v-if="isGlobalLoading" class="global-loader-overlay" role="status" aria-live="polite" aria-label="Carregando dados">
      <div class="global-loader-content">
        <div class="loader-spinner" aria-hidden="true"></div>
        <p>Carregando informações...</p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { isGlobalLoading } from './stores/loadingState.js';
</script>

<style>
.app-shell {
  background: transparent;
}

.app-main {
  min-height: 100vh;
  background: transparent;
}

.v-application {
  background: transparent !important;
  font-family: inherit !important;
}
</style>

<style scoped>
.global-loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 15, 0.65);
  backdrop-filter: blur(4px);
}

.global-loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(168, 85, 247, 0.28);
  border-radius: 0.9rem;
  background: rgba(15, 23, 42, 0.95);
  color: #e5e7eb;
  font-weight: 600;
  min-width: 220px;
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.4);
}

.loader-spinner {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 9999px;
  border: 3px solid rgba(255, 255, 255, 0.24);
  border-top-color: #a855f7;
  animation: spin 0.75s linear infinite;
}

.fade-loader-enter-active,
.fade-loader-leave-active {
  transition: opacity 0.2s ease;
}

.fade-loader-enter-from,
.fade-loader-leave-to {
  opacity: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

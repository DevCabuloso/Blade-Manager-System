<template>
  <div class="layout-shell">
    <v-navigation-drawer
      v-model="drawerOpen"
      :temporary="isMobile"
      :width="272"
      location="left"
      color="rgba(2, 6, 23, 0.98)"
      class="layout-drawer"
      elevation="0"
    >
      <div class="layout-brand">
        <div>
          <p class="layout-brand__title">Blade Manager</p>
        </div>
      </div>

      <v-divider class="layout-divider" />

      <v-list nav density="comfortable" class="layout-nav">
        <v-list-item
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          rounded="xl"
          class="layout-nav-item"
          @click="handleNavigate"
        >
          <v-list-item-title class="layout-nav-title">
            {{ item.label }}
          </v-list-item-title>
          <v-list-item-subtitle class="layout-nav-subtitle">
            {{ item.subtitle }}
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <template #append>
        <div class="layout-append">
          <AppButton variant="danger" block @click="logout">
            Sair
          </AppButton>
        </div>
      </template>
    </v-navigation-drawer>

    <div class="layout-main">
      <v-app-bar flat color="rgba(2, 6, 23, 0.82)" class="layout-header">
        <AppButton v-if="isMobile" variant="secondary" rounded="xl" class="layout-menu-action" @click="toggleSidebar">
          {{ drawerOpen ? 'Fechar Menu' : 'Abrir Menu' }}
        </AppButton>

        <v-spacer />

        <AppButton v-if="!isMobile" variant="danger" rounded="xl" class="layout-logout-action" @click="logout">
          Sair
        </AppButton>

        <div class="layout-user-block">
          <span class="layout-user-label">Bem-vindo(a)</span>
          <strong class="layout-user-name">{{ userName }}</strong>
        </div>
      </v-app-bar>

      <section class="layout-content">
        <slot />
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '@/components/ui/AppButton.vue';
import { clearAuthSession, getStoredUser } from '@/utils/authStorage.js';

const router = useRouter();
const userName = ref('Profissional');
const isMobile = ref(false);
const showSidebar = ref(false);

const navItems = [
  { to: '/dashboard', label: 'Dashboard', subtitle: 'Visão geral', icon: 'mdi-view-dashboard-outline' },
  { to: '/agenda', label: 'Agenda', subtitle: 'Compromissos do mês', icon: 'mdi-calendar-month-outline' },
  { to: '/services', label: 'Serviços', subtitle: 'Catálogo e preços', icon: 'mdi-content-cut' },
  { to: '/horarios', label: 'Horários', subtitle: 'Disponibilidade', icon: 'mdi-clock-outline' },
  { to: '/profile', label: 'Perfil', subtitle: 'Dados profissionais', icon: 'mdi-account-outline' },
];

const drawerOpen = computed({
  get: () => (isMobile.value ? showSidebar.value : true),
  set: (value) => {
    if (isMobile.value) {
      showSidebar.value = value;
    }
  },
});

const checkMobile = () => {
  const mobile = window.innerWidth < 960;
  isMobile.value = mobile;

  if (!mobile) {
    showSidebar.value = false;
  }
};

onMounted(() => {
  const user = getStoredUser();
  if (user?.nome_usuario) {
    userName.value = user.nome_usuario;
  }

  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile);
});

function toggleSidebar() {
  if (isMobile.value) {
    showSidebar.value = !showSidebar.value;
  }
}

function logout() {
  clearAuthSession();
  router.push('/');
}

function handleNavigate() {
  if (isMobile.value) {
    showSidebar.value = false;
  }
}
</script>

<style scoped>
.layout-shell {
  min-height: 100vh;
  display: flex;
  background: transparent;
  color: #e2e8f0;
}

.layout-drawer {
  border-right: 1px solid rgba(148, 163, 184, 0.12) !important;
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.45);
}

.layout-brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1.4rem 1.15rem 1rem;
}

.layout-brand__mark {
  display: grid;
  width: 2.7rem;
  height: 2.7rem;
  place-items: center;
  border-radius: 0.95rem;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.24), rgba(126, 34, 206, 0.46));
  color: #fff7ed;
  font-size: 0.9rem;
  font-weight: 900;
  letter-spacing: 0.05em;
}

.layout-brand__title {
  margin: 0;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 800;
}

.layout-brand__subtitle {
  margin: 0.15rem 0 0;
  color: #94a3b8;
  font-size: 0.78rem;
}

.layout-divider {
  opacity: 0.5;
}

.layout-nav {
  padding: 0.9rem 0.75rem;
}

.layout-nav-item {
  margin-bottom: 0.4rem;
  color: #cbd5e1;
}

.layout-nav-item:hover {
  background: rgba(168, 85, 247, 0.12);
}

.layout-nav-item :deep(.v-list-item__content) {
  align-self: center;
}

.layout-nav-item :deep(.v-list-item__prepend) {
  align-self: center;
  margin-inline-end: 0.85rem;
}

.layout-nav-item :deep(.v-list-item__prepend > .v-icon) {
  display: grid;
  place-items: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 0.8rem;
  background: rgba(168, 85, 247, 0.14);
  color: #f5f3ff;
  font-size: 1.02rem;
  line-height: 1;
}

.layout-nav-item :deep(.v-list-item-title) {
  font-weight: 700;
}

.layout-nav-item :deep(.v-list-item-subtitle) {
  color: #94a3b8;
  opacity: 1;
}

.layout-nav-item :deep(.v-list-item--active) {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(168, 85, 247, 0.08));
}

.layout-nav-title {
  color: #f8fafc;
}

.layout-nav-subtitle {
  margin-top: 0.1rem;
}

.layout-append {
  padding: 0.9rem;
}

.layout-main {
  flex: 1;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.layout-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(2, 6, 23, 0.82);
  backdrop-filter: blur(12px);
}

.layout-menu-action {
  min-width: 116px;
}

.layout-logout-action {
  min-width: 96px;
}

.layout-user-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.12rem;
}

.layout-user-label {
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 700;
}

.layout-user-name {
  color: #f8fafc;
  font-size: 1.22rem;
  font-weight: 800;
}

.layout-content {
  flex: 1;
}

@media (max-width: 959px) {
  .layout-header {
    padding-inline: 0.75rem;
  }

  .layout-user-name {
    font-size: 1.05rem;
  }
}
</style>

<template>
  <div class="flex h-screen bg-gray-50 text-gray-800">
    <div 
      v-if="isMobile && showMobileSidebar" 
      class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
      @click="toggleSidebar"
    ></div>

    <aside
      :class="[ 
        'flex flex-col justify-between fixed md:static z-50 transition-transform duration-300 h-full shadow-2xl',
        isMobile ? 'w-64' : (isCollapsed ? 'w-16' : 'w-56'),
        isMobile && !showMobileSidebar ? '-translate-x-full' : 'translate-x-0',
        'bg-gray-950  text-white',
        isMobile && showMobileSidebar ? 'bg-opacity-90' : 'bg-opacity-100'
      ]"
    >
      <div class="overflow-hidden h-full flex flex-col">
        <div class="flex items-center px-4 py-5">
          <span v-if="!isCollapsed || isMobile" class="text-xl font-bold tracking-tight">BladeManager</span>
          <span v-else class="text-xl font-bold">O</span>
        </div>
        
        <nav class="flex flex-col p-3 gap-2 flex-grow overflow-y-auto">
          <RouterLink class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200" to="/dashboard">
            <div class="w-5 h-5 bg-white/70 rounded-full"></div> 
            <span v-if="!isCollapsed || isMobile" class="font-medium">Dashboard</span>
          </RouterLink>
          <RouterLink class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200" to="/agenda">
            <div class="w-5 h-5 bg-white/70 rounded-full"></div> 
            <span v-if="!isCollapsed || isMobile" class="font-medium">Agenda</span>
          </RouterLink>
          <RouterLink class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200" to="/services">
            <div class="w-5 h-5 bg-white/70 rounded-full"></div> 
            <span v-if="!isCollapsed || isMobile" class="font-medium">Serviços</span>                   
          </RouterLink>
          <RouterLink class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200" to="/horarios">
            <div class="w-5 h-5 bg-white/70 rounded-full"></div> 
            <span v-if="!isCollapsed || isMobile" class="font-medium">Horários</span>
          </RouterLink>
          <RouterLink class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200" to="/profile">
            <div class="w-5 h-5 bg-white/70 rounded-full"></div> 
            <span v-if="!isCollapsed || isMobile" class="font-medium">Perfil</span>
          </RouterLink>
        </nav>

        <div class="p-3 border-t border-blue-800/50">
          <RouterLink
            to="/"
            class="nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-red-300 hover:text-red-400 hover:bg-blue-800/50 font-semibold transition-all duration-200"
            @click="logout"
          >
            <div class="w-5 h-5 bg-white/70 rounded-full"></div> 
            <span v-if="!isCollapsed || isMobile">Sair</span>
          </RouterLink>
        </div>
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-y-auto ml-0 md:ml-auto">
      <header class="bg-gradient-to-r bg-gray-950 shadow px-4 py-4 flex justify-between items-center md:px-6">
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebar"
            class="w-6 h-6 flex flex-col justify-between focus:outline-none text-white hover:text-gray-200"
          >
            <span class="w-full h-1 bg-white rounded"></span>
            <span class="w-full h-1 bg-white rounded"></span>
            <span class="w-full h-1 bg-white rounded"></span>
          </button>
        </div>
        <div class="text-lg md:text-xl font-semibold flex items-center gap-2 text-white">
          Bem-vindo(a), {{ userName }}
        </div>
      </header>

      <section class="">
        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userName = ref('Profissional');
const isCollapsed = ref(false);
const isMobile = ref(false);
const showMobileSidebar = ref(false);

onMounted(() => {
  const userStorage = sessionStorage.getItem('user');
  if (userStorage) {
    try {
      const userObj = JSON.parse(userStorage);
      if (userObj?.nome_usuario) userName.value = userObj.nome_usuario;
    } catch (e) {
      console.error('Erro ao parsear user do sessionStorage:', e);
    }
  }

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

watch(isCollapsed, (newVal) => {
  sessionStorage.setItem('sidebarCollapsed', newVal);
});

function toggleSidebar() {
  if (isMobile.value) {
    showMobileSidebar.value = !showMobileSidebar.value;
  } else {
    isCollapsed.value = !isCollapsed.value;
  }
}

function logout() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userId');
  router.push('/');
}
</script>

<style scoped>
.nav-link {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
}
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}
.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}
</style>

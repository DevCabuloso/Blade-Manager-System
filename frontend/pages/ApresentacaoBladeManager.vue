<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col">
    <!-- Header -->
    <header
      class="flex items-center justify-between px-10 py-6 bg-gray-950 backdrop-blur-md shadow-lg fixed w-full z-50"
    >
      <h1
        class="text-3xl font-extrabold tracking-wide text-purple-400 cursor-pointer"
        @click="scrollToSection('top')"
      >
        Blade<span class="text-white">Manager</span>
      </h1>

      <nav class="space-x-6 hidden sm:flex">
        <button @click="scrollToSection('modules')" class="hover:text-purple-400 transition">
          Módulos
        </button>
        <button @click="scrollToSection('tech')" class="hover:text-purple-400 transition">
          Tecnologias
        </button>
        <button @click="scrollToSection('security')" class="hover:text-purple-400 transition">
          Segurança
        </button>
      </nav>

      <button
        @click="goToLogin"
        class="bg-purple-500 hover:bg-purple-600 px-5 py-2 rounded-xl text-sm font-semibold transition"
      >
        Entrar
      </button>
    </header>

    <!-- Hero Section -->
    <section id="top" class="text-center py-32 px-8 mt-20">
      <h2 class="text-5xl font-extrabold mb-6">
        <span class="text-purple-400">Recursos</span> do Sistema
      </h2>
      <p class="max-w-3xl mx-auto text-gray-300 text-lg leading-relaxed">
        Conheça em detalhes o poder, a segurança e a praticidade do
        <span class="text-white font-semibold">Blade Manager System</span>.  
        Desenvolvido para unir design moderno e controle total da sua operação.
      </p>
    </section>

    <!-- System Modules -->
    <section id="modules" class="py-20 bg-gray-800 scroll-mt-24">
      <h3 class="text-3xl font-bold text-center mb-12">Módulos do Sistema</h3>

      <div class="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-8">
        <div
          class="p-6 bg-gray-900 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1"
        >
          <h4 class="text-xl font-semibold text-purple-400 mb-3">Usuários</h4>
          <p class="text-gray-300">
            Cadastro completo de clientes, administradores e profissionais, com controle de status
            (ativo/inativo), permissões e autenticação segura via JWT.
          </p>
        </div>

        <div
          class="p-6 bg-gray-900 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1"
        >
          <h4 class="text-xl font-semibold text-purple-400 mb-3">Serviços</h4>
          <p class="text-gray-300">
            Gerencie serviços oferecidos por cada profissional: valores, descrições e tempo de execução,
            tudo centralizado e de fácil atualização.
          </p>
        </div>

        <div
          class="p-6 bg-gray-900 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1"
        >
          <h4 class="text-xl font-semibold text-purple-400 mb-3">Agendamentos</h4>
          <p class="text-gray-300">
            Controle inteligente de horários e datas, evitando conflitos e garantindo uma experiência fluida
            para o cliente e o profissional.
          </p>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-8 mt-12">
        <div
          class="p-6 bg-gray-900 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1"
        >
          <h4 class="text-xl font-semibold text-purple-400 mb-3">Painel Administrativo</h4>
          <p class="text-gray-300">
            Visualize informações completas sobre usuários, serviços e agendamentos com gráficos, tabelas e
            controles rápidos.
          </p>
        </div>

        <div
          class="p-6 bg-gray-900 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1"
        >
          <h4 class="text-xl font-semibold text-purple-400 mb-3">Histórico de Atividades</h4>
          <p class="text-gray-300">
            Monitore alterações, cadastros e exclusões realizadas no sistema com registro de data e hora.
          </p>
        </div>

        <div
          class="p-6 bg-gray-900 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1"
        >
          <h4 class="text-xl font-semibold text-purple-400 mb-3">Relatórios e Estatísticas</h4>
          <p class="text-gray-300">
            Geração de relatórios completos e exportação de dados em tempo real para tomada de decisão
            eficiente.
          </p>
        </div>
      </div>
    </section>

    <!-- Technologies -->
    <section id="tech" class="py-20 text-center bg-gray-900 scroll-mt-24">
  <h3 class="text-3xl font-bold text-purple-400 mb-8">Tecnologias Utilizadas</h3>
  <p class="text-gray-300 max-w-3xl mx-auto text-lg mb-12">
    O sistema foi construído com base nas tecnologias mais modernas do mercado para garantir escalabilidade,
    segurança e performance.
  </p>

  <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
    <!-- Vue.js -->
    <div class="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1">
      <div class="flex flex-col items-center">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" alt="Vue.js" class="w-16 h-16 mb-4">
        <h4 class="font-semibold text-lg text-white mb-2">Vue.js</h4>
        <p class="text-gray-400 text-sm text-center">
          Framework progressivo para interfaces dinâmicas e reativas.
        </p>
      </div>
    </div>

    <!-- TailwindCSS (corrigido) -->
    <div class="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1">
      <div class="flex flex-col items-center">
        <img src="https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg" alt="TailwindCSS" class="w-16 h-16 mb-4">
        <h4 class="font-semibold text-lg text-white mb-2">TailwindCSS</h4>
        <p class="text-gray-400 text-sm text-center">
          Estilo moderno e responsivo com utilitários otimizados.
        </p>
      </div>
    </div>

    <!-- Node.js -->
    <div class="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1">
      <div class="flex flex-col items-center">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" alt="Node.js" class="w-16 h-16 mb-4">
        <h4 class="font-semibold text-lg text-white mb-2">Node.js</h4>
        <p class="text-gray-400 text-sm text-center">
          Backend leve e rápido para manipulação de rotas e APIs RESTful.
        </p>
      </div>
    </div>

    <!-- PostgreSQL -->
    <div class="bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-purple-500/20 transition transform hover:-translate-y-1">
      <div class="flex flex-col items-center">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" class="w-16 h-16 mb-4">
        <h4 class="font-semibold text-lg text-white mb-2">PostgreSQL</h4>
        <p class="text-gray-400 text-sm text-center">
          Banco de dados relacional robusto e confiável para alta performance.
        </p>
      </div>
    </div>
  </div>
</section>

    <!-- Security -->
    <section id="security" class="py-20 bg-gray-800 text-center scroll-mt-24">
      <h3 class="text-3xl font-bold text-purple-400 mb-6">Segurança e Desempenho</h3>
      <p class="text-gray-300 max-w-4xl mx-auto text-lg leading-relaxed">
        O Blade Manager System protege dados sensíveis com criptografia avançada, autenticação via JWT e
        controle de acesso baseado em perfis.  
        Todo o tráfego é monitorado e otimizado para garantir estabilidade e eficiência no uso diário.
      </p>
    </section>

    <!-- Social Links -->
    <section class="bg-gray-900 py-12 text-center">
      <h3 class="text-2xl font-semibold text-purple-400 mb-6">Conecte-se comigo</h3>
      <div class="flex justify-center gap-8">
        <a
          href="https://www.instagram.com/okarlos.nunes?igsh=MWd1NyYtJ6djBoeA=="
          target="_blank"
          class="bg-gray-800 hover:bg-purple-600 p-4 rounded-full transition shadow-lg hover:shadow-purple-500/30"
          aria-label="Instagram"
        >
          <i class="fab fa-instagram text-2xl"></i>
        </a>
        <a
          href="https://github.com/DevCabuloso"
          target="_blank"
          class="bg-gray-800 hover:bg-purple-600 p-4 rounded-full transition shadow-lg hover:shadow-purple-500/30"
          aria-label="GitHub"
        >
          <i class="fab fa-github text-2xl"></i>
        </a>
        <a
          href="https://www.linkedin.com/in/karlos-nunes-128097306?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
          target="_blank"
          class="bg-gray-800 hover:bg-purple-600 p-4 rounded-full transition shadow-lg hover:shadow-purple-500/30"
          aria-label="LinkedIn"
        >
          <i class="fab fa-linkedin text-2xl"></i>
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-950 text-gray-400 py-6 text-center text-sm border-t border-gray-800">
      <p>© {{ new Date().getFullYear() }} Blade Manager System. Todos os direitos reservados.</p>
      <p class="text-xs mt-2">Desenvolvido com 💜 por Karlos Eduardo</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const goToLogin = () => {
  router.push('/login');
};
</script>



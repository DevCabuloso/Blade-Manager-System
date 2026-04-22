<template>
  <div class="marketing-page">
    <div class="marketing-glow marketing-glow--left"></div>
    <div class="marketing-glow marketing-glow--right"></div>

    <header class="marketing-header safe-area-pt">
      <v-container class="marketing-container marketing-header__inner">
        <button class="marketing-brand" @click="scrollToSection('top')">
          Blade<span>Manager</span>
        </button>

        <nav class="marketing-nav">
          <v-btn variant="text" class="marketing-nav-button" @click="scrollToSection('features')">Módulos</v-btn>
          <v-btn variant="text" class="marketing-nav-button" @click="scrollToSection('flow')">Fluxo</v-btn>
          <v-btn variant="text" class="marketing-nav-button" @click="scrollToSection('tech')">Tecnologias</v-btn>
          <v-btn variant="text" class="marketing-nav-button" @click="scrollToSection('security')">Segurança</v-btn>
        </nav>

        <v-btn color="primary" rounded="xl" class="text-none font-weight-bold" @click="goToLogin">Entrar</v-btn>
      </v-container>
    </header>

    <v-container id="top" class="marketing-container marketing-section marketing-section--hero">
      <v-row align="center" class="ga-6">
        <v-col cols="12" lg="7">
          <p class="marketing-eyebrow">Gestão Completa para Barbearias</p>
          <h1 class="marketing-hero-title">
            Seu negócio organizado,
            <span>agendado e pronto para crescer.</span>
          </h1>
          <p class="marketing-hero-copy">
            O Blade Manager centraliza profissionais, serviços, horários e relatórios em uma experiência elegante e rápida.
            Você administra tudo em minutos, no desktop e no mobile.
          </p>

          <div class="marketing-actions">
            <v-btn color="primary" rounded="xl" class="text-none font-weight-bold" @click="goToContact">
              Começar Agora
            </v-btn>
            <v-btn variant="outlined" rounded="xl" class="text-none font-weight-bold" @click="scrollToSection('features')">
              Ver Recursos
            </v-btn>
          </div>

          <v-row dense class="marketing-stat-grid">
            <v-col v-for="stat in heroStats" :key="stat.label" cols="6" sm="3">
              <v-card rounded="xl" border color="rgba(15, 23, 42, 0.75)" class="marketing-stat-card">
                <v-card-text>
                  <p class="marketing-stat-label">{{ stat.label }}</p>
                  <p class="marketing-stat-value" :class="stat.className">{{ stat.value }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="12" lg="5">
          <v-sheet rounded="xl" border color="rgba(3, 7, 18, 0.82)" class="marketing-overview">
            <h2 class="marketing-overview__title">Visão geral em tempo real</h2>

            <v-card rounded="xl" border color="rgba(15, 23, 42, 0.72)" class="mb-4">
              <v-card-text>
                <p class="marketing-overview__label">Agendamentos do dia</p>
                <p class="marketing-overview__value">18</p>
                <v-progress-linear model-value="75" color="primary" rounded class="mt-4" />
              </v-card-text>
            </v-card>

            <v-row dense>
              <v-col cols="6">
                <v-card rounded="xl" border color="rgba(15, 23, 42, 0.72)">
                  <v-card-text>
                    <p class="marketing-overview__label">Pendentes</p>
                    <p class="marketing-overview__mini-value marketing-overview__mini-value--warning">7</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card rounded="xl" border color="rgba(15, 23, 42, 0.72)">
                  <v-card-text>
                    <p class="marketing-overview__label">Atendidos</p>
                    <p class="marketing-overview__mini-value marketing-overview__mini-value--success">11</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <v-card rounded="xl" border color="rgba(15, 23, 42, 0.72)" class="mt-4">
              <v-card-text>
                <p class="marketing-overview__label">Faturamento estimado</p>
                <p class="marketing-overview__billing">R$ 1.840,00</p>
              </v-card-text>
            </v-card>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>

    <section id="features" class="marketing-band marketing-band--soft">
      <v-container class="marketing-container marketing-section">
        <div class="marketing-section-head">
          <div>
            <p class="marketing-section-kicker">Módulos</p>
            <h2 class="marketing-section-title">Tudo que você precisa em um painel único</h2>
          </div>
          <p class="marketing-section-description">
            Controle de ponta a ponta com uma experiência pensada para decisões rápidas, operação diária e crescimento sustentável.
          </p>
        </div>

        <v-row dense>
          <v-col v-for="module in modules" :key="module.title" cols="12" sm="6" lg="4">
            <v-card rounded="xl" border color="rgba(3, 7, 18, 0.76)" class="marketing-card marketing-card--hover">
              <v-card-text>
                <h3 class="marketing-card-title">{{ module.title }}</h3>
                <p class="marketing-card-copy">{{ module.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section id="flow" class="marketing-section">
      <v-container class="marketing-container">
        <h2 class="marketing-section-title">Como funciona no dia a dia</h2>
        <v-row dense class="mt-6">
          <v-col v-for="(step, index) in steps" :key="step.title" cols="12" md="4">
            <v-card rounded="xl" border color="rgba(15, 23, 42, 0.72)" class="marketing-card">
              <v-card-text>
                <p class="marketing-step-kicker">Passo {{ index + 1 }}</p>
                <h3 class="marketing-card-title marketing-card-title--light">{{ step.title }}</h3>
                <p class="marketing-card-copy">{{ step.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section id="tech" class="marketing-band marketing-band--soft">
      <v-container class="marketing-container marketing-section">
        <h2 class="marketing-section-title">Tecnologias Utilizadas</h2>
        <p class="marketing-section-description marketing-section-description--wide">
          Arquitetura moderna para garantir performance, manutenção simples e escalabilidade da operação.
        </p>

        <v-row dense class="mt-6">
          <v-col v-for="tech in technologies" :key="tech.name" cols="12" sm="6" lg="3">
            <v-card rounded="xl" border color="rgba(3, 7, 18, 0.76)" class="marketing-card marketing-card--center">
              <v-card-text>
                <img :src="tech.logo" :alt="tech.name" class="marketing-tech-logo" />
                <h3 class="marketing-card-title">{{ tech.name }}</h3>
                <p class="marketing-card-copy">{{ tech.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section id="security" class="marketing-section">
      <v-container class="marketing-container">
        <v-sheet rounded="xl" border color="rgba(3, 7, 18, 0.82)" class="marketing-security-panel">
          <h2 class="marketing-section-title marketing-section-title--accent">Segurança e Desempenho</h2>
          <p class="marketing-section-description marketing-section-description--wide">
            O Blade Manager protege dados sensíveis com autenticação via JWT, controle por papéis e boas práticas de isolamento.
            O fluxo de requisições é otimizado para manter estabilidade mesmo em picos de uso.
          </p>
          <v-row dense class="mt-6">
            <v-col v-for="item in securityItems" :key="item.label" cols="12" sm="4">
              <v-card rounded="xl" border color="rgba(15, 23, 42, 0.72)">
                <v-card-text>
                  <p class="marketing-security-label">{{ item.label }}</p>
                  <p class="marketing-security-value">{{ item.value }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </v-container>
    </section>

    <section class="marketing-band marketing-band--social">
      <v-container class="marketing-container marketing-social">
        <h3 class="marketing-social__title">Conecte-se comigo</h3>
        <div class="marketing-social__list">
          <v-btn
            v-for="social in socials"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            icon
            variant="tonal"
            class="marketing-social__button"
            :aria-label="social.label"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path :d="social.iconPath"></path>
            </svg>
          </v-btn>
        </div>
      </v-container>
    </section>

    <footer class="marketing-footer">
      <p>© {{ new Date().getFullYear() }} Blade Manager System. Todos os direitos reservados.</p>
      <p>Desenvolvido com carinho por Karlos Eduardo</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const modules = [
  {
    title: 'Usuários',
    description: 'Cadastro de clientes, profissionais e administradores com autenticação segura e controle de permissões.',
  },
  {
    title: 'Serviços',
    description: 'Gestão de serviços com preço, duração e organização por profissional em poucos cliques.',
  },
  {
    title: 'Agendamentos',
    description: 'Agenda inteligente com bloqueio de conflitos e disponibilidade dinâmica por horário e duração.',
  },
  {
    title: 'Painel Administrativo',
    description: 'Visão global da operação com ações rápidas para manter o fluxo sempre estável.',
  },
  {
    title: 'Horários de Atendimento',
    description: 'Controle de expediente por dia da semana para oferecer previsibilidade e melhor experiência ao cliente.',
  },
  {
    title: 'Relatórios',
    description: 'Métricas e histórico para apoiar decisões estratégicas com base no comportamento real da operação.',
  },
];

const steps = [
  {
    title: 'Configure sua operação',
    description: 'Cadastre profissionais, serviços e horários de atendimento de forma simples e centralizada.',
  },
  {
    title: 'Receba agendamentos',
    description: 'Clientes escolhem serviço e horário disponível com validação de conflitos em tempo real.',
  },
  {
    title: 'Acompanhe resultados',
    description: 'Use os painéis para visualizar produtividade, atendimentos e crescimento do negócio.',
  },
];

const technologies = [
  {
    name: 'Vue.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    description: 'Interface reativa e fluida para uma experiência moderna.',
  },
  {
    name: 'Vuetify',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuetify/vuetify-original.svg',
    description: 'Sistema visual consistente para telas responsivas e rápidas de manter.',
  },
  {
    name: 'Node.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    description: 'API rápida e confiável para operações em tempo real.',
  },
  {
    name: 'PostgreSQL',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    description: 'Persistência robusta e segura para dados críticos.',
  },
];

const heroStats = [
  { label: 'Módulos', value: '6+', className: 'marketing-stat-value--accent' },
  { label: 'Disponível', value: '24/7', className: 'marketing-stat-value--success' },
  { label: 'Performance', value: 'Alta', className: 'marketing-stat-value--accent' },
  { label: 'Ambientes', value: 'Multi', className: 'marketing-stat-value--accent' },
];

const securityItems = [
  { label: 'Autenticação', value: 'JWT por sessão' },
  { label: 'Integridade', value: 'Validação de dados' },
  { label: 'Confiabilidade', value: 'Logs e monitoramento' },
];

const socials = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/okarlos.nunes?igsh=MWd1NyYtJ6djBoeA==',
    iconPath: 'M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm8.43 1.75H7.82A4.07 4.07 0 0 0 3.75 7.82v8.36c0 2.25 1.82 4.07 4.07 4.07h8.36a4.07 4.07 0 0 0 4.07-4.07V7.82a4.07 4.07 0 0 0-4.07-4.07ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Zm5.35-2.18a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/DevCabuloso',
    iconPath: 'M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.25c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.74-1.33-1.74-1.09-.75.08-.73.08-.73 1.2.08 1.83 1.24 1.83 1.24 1.08 1.85 2.82 1.31 3.5 1 .11-.79.42-1.31.76-1.61-2.67-.31-5.47-1.33-5.47-5.92 0-1.31.47-2.39 1.24-3.23-.13-.31-.54-1.56.12-3.25 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.3-1.55 3.29-1.23 3.29-1.23.66 1.69.25 2.94.12 3.25.77.84 1.24 1.92 1.24 3.23 0 4.6-2.8 5.61-5.48 5.91.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/karlos-nunes-128097306?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
    iconPath: 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z',
  },
];

const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const goToLogin = () => {
  router.push('/login');
};

const goToContact = () => {
  const rawNumber = import.meta.env.VITE_CONTACT_WHATSAPP || '5548998076008';
  const number = String(rawNumber).replace(/\D/g, '');

  if (!number) {
    window.alert('WhatsApp de contato nao configurado. Defina VITE_CONTACT_WHATSAPP no frontend.');
    return;
  }

  const message = encodeURIComponent('Ola! Vim pelo Blade Manager e gostaria de conversar sobre o sistema.');
  window.open(`https://wa.me/${number}?text=${message}`, '_blank');
};
</script>

<style scoped>
.marketing-page {
  position: relative;
  min-height: 100vh;
  color: #f8fafc;
  background: linear-gradient(180deg, #020617 0%, #111827 55%, #020617 100%);
}

.marketing-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(90px);
  pointer-events: none;
}

.marketing-glow--left {
  top: 3rem;
  left: -6rem;
  width: 18rem;
  height: 18rem;
  background: rgba(168, 85, 247, 0.14);
}

.marketing-glow--right {
  top: 0;
  right: 0;
  width: 20rem;
  height: 20rem;
  background: rgba(56, 189, 248, 0.1);
}

.marketing-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(2, 6, 23, 0.78);
  backdrop-filter: blur(16px);
}

.marketing-container {
  width: min(1200px, 100%);
}

.marketing-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1rem;
}

.marketing-brand {
  color: #c084fc;
  font-size: 1.65rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.marketing-brand span {
  color: #f8fafc;
}

.marketing-nav {
  display: none;
  align-items: center;
  gap: 0.25rem;
}

.marketing-nav-button {
  color: #cbd5e1;
  text-transform: none;
  letter-spacing: 0;
}

.marketing-nav-button:hover {
  color: #c084fc;
}

.marketing-section {
  padding-block: 4rem;
}

.marketing-section--hero {
  padding-top: 4.5rem;
}

.marketing-eyebrow,
.marketing-section-kicker,
.marketing-step-kicker,
.marketing-security-label {
  margin: 0;
  color: #c084fc;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.marketing-eyebrow {
  display: inline-flex;
  padding: 0.45rem 0.8rem;
  border: 1px solid rgba(168, 85, 247, 0.28);
  border-radius: 999px;
  background: rgba(168, 85, 247, 0.08);
}

.marketing-hero-title,
.marketing-section-title {
  margin: 0;
  color: #f8fafc;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.marketing-hero-title {
  margin-top: 1rem;
  font-size: clamp(2.6rem, 6vw, 5rem);
}

.marketing-hero-title span,
.marketing-section-title--accent,
.marketing-card-title,
.marketing-social__title {
  color: #c084fc;
}

.marketing-hero-copy,
.marketing-section-description,
.marketing-card-copy {
  color: #cbd5e1;
  line-height: 1.7;
}

.marketing-hero-copy {
  max-width: 42rem;
  margin: 1.25rem 0 0;
}

.marketing-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.marketing-stat-grid {
  margin-top: 1.5rem;
}

.marketing-stat-card,
.marketing-card,
.marketing-overview,
.marketing-security-panel {
  border-color: rgba(148, 163, 184, 0.14) !important;
  box-shadow: 0 24px 50px rgba(2, 6, 23, 0.35);
}

.marketing-stat-label,
.marketing-overview__label {
  margin: 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

.marketing-stat-value,
.marketing-overview__value,
.marketing-overview__billing,
.marketing-overview__mini-value {
  margin: 0.45rem 0 0;
  font-weight: 900;
}

.marketing-stat-value--accent,
.marketing-overview__billing,
.marketing-overview__title {
  color: #c084fc;
}

.marketing-stat-value--success,
.marketing-overview__mini-value--success {
  color: #4ade80;
}

.marketing-overview {
  padding: 1.5rem;
}

.marketing-overview__title {
  margin: 0 0 1rem;
  font-size: 1.15rem;
  font-weight: 800;
}

.marketing-overview__value {
  color: #f8fafc;
  font-size: 2rem;
}

.marketing-overview__mini-value--warning {
  color: #facc15;
}

.marketing-band {
  border-block: 1px solid rgba(148, 163, 184, 0.08);
}

.marketing-band--soft {
  background: rgba(15, 23, 42, 0.38);
}

.marketing-section-head {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.marketing-section-description {
  max-width: 42rem;
  margin-top: 0.85rem;
}

.marketing-section-description--wide {
  max-width: 56rem;
}

.marketing-card {
  height: 100%;
}

.marketing-card--hover {
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.marketing-card--hover:hover {
  transform: translateY(-3px);
  border-color: rgba(168, 85, 247, 0.32) !important;
}

.marketing-card--center {
  text-align: center;
}

.marketing-card-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.marketing-card-title--light,
.marketing-security-value {
  color: #f8fafc;
}

.marketing-card-copy {
  margin: 0.85rem 0 0;
}

.marketing-tech-logo {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
}

.marketing-security-panel {
  padding: 1.75rem;
}

.marketing-security-value {
  margin: 0.55rem 0 0;
  font-weight: 800;
}

.marketing-band--social {
  background: rgba(15, 23, 42, 0.28);
}

.marketing-social {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-block: 3rem;
}

.marketing-social__title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
}

.marketing-social__list {
  display: flex;
  gap: 0.75rem;
}

.marketing-social__button {
  color: #e2e8f0;
}

.marketing-footer {
  padding: 1.5rem 1rem 2rem;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  color: #94a3b8;
  font-size: 0.9rem;
  text-align: center;
}

.marketing-footer p {
  margin: 0.2rem 0;
}

@media (min-width: 960px) {
  .marketing-nav {
    display: flex;
  }

  .marketing-section-head {
    flex-direction: row;
    align-items: end;
    justify-content: space-between;
  }
}
</style>

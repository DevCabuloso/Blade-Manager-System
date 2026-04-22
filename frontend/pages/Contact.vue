<template>
  <div class="contact-page">
    <div class="contact-glow contact-glow--left"></div>
    <div class="contact-glow contact-glow--right"></div>

    <header class="contact-header safe-area-pt">
      <v-container class="contact-container contact-header__inner">
        <button @click="goHome" class="contact-brand">
          Blade<span>Manager</span>
        </button>

        <v-btn color="primary" variant="outlined" rounded="xl" class="text-none font-weight-bold" @click="goHome">
          Voltar
        </v-btn>
      </v-container>
    </header>

    <v-container class="contact-container contact-main">
      <div class="contact-copy">
        <p class="contact-eyebrow">Contato</p>
        <h1 class="contact-title">Abrindo seu WhatsApp...</h1>
        <p class="contact-description">
          Se o redirecionamento nao abrir automaticamente, clique no botao abaixo para continuar o contato direto no WhatsApp.
        </p>
      </div>

      <v-row dense>
        <v-col cols="12" lg="8">
          <v-sheet rounded="xl" border color="rgba(3, 7, 18, 0.82)" class="contact-card">
            <p class="contact-card__text">Contato rapido e direto. Sem formulario.</p>
            <v-btn color="primary" rounded="xl" class="text-none font-weight-bold mt-5" @click="openWhatsApp">
              Abrir WhatsApp Agora
            </v-btn>
          </v-sheet>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card rounded="xl" border color="rgba(15, 23, 42, 0.72)" class="contact-info-card">
            <v-card-text>
              <p class="contact-info-card__label">Atendimento</p>
              <p class="contact-info-card__text">Conversa direta para tirar duvidas, orçamento e implantação.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();
const rawNumber = import.meta.env.VITE_CONTACT_WHATSAPP || '5548998076008';
const number = String(rawNumber).replace(/\D/g, '');

const goHome = () => {
  router.push('/');
};

const openWhatsApp = () => {
  if (!number) {
    toast.error('WhatsApp de contato nao configurado. Defina VITE_CONTACT_WHATSAPP.');
    return;
  }

  const message = encodeURIComponent('Ola! Vim pelo Blade Manager e gostaria de conversar sobre o sistema.');
  window.open(`https://wa.me/${number}?text=${message}`, '_blank');
};

onMounted(() => {
  openWhatsApp();
});
</script>

<style scoped>
.contact-page {
  position: relative;
  min-height: 100vh;
  color: #f8fafc;
  background: linear-gradient(180deg, #020617 0%, #111827 55%, #020617 100%);
}

.contact-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(90px);
  pointer-events: none;
}

.contact-glow--left {
  top: 4rem;
  left: -6rem;
  width: 18rem;
  height: 18rem;
  background: rgba(168, 85, 247, 0.14);
}

.contact-glow--right {
  top: 0;
  right: 0;
  width: 20rem;
  height: 20rem;
  background: rgba(56, 189, 248, 0.1);
}

.contact-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: rgba(2, 6, 23, 0.78);
  backdrop-filter: blur(16px);
}

.contact-container {
  width: min(1040px, 100%);
}

.contact-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1rem;
}

.contact-brand {
  color: #c084fc;
  font-size: 1.65rem;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.contact-brand span {
  color: #f8fafc;
}

.contact-main {
  position: relative;
  padding-block: 3rem;
}

.contact-copy {
  margin-bottom: 2rem;
}

.contact-eyebrow {
  display: inline-flex;
  margin: 0 0 0.9rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(168, 85, 247, 0.28);
  background: rgba(168, 85, 247, 0.08);
  color: #c084fc;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.contact-title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
}

.contact-description,
.contact-card__text,
.contact-info-card__text {
  color: #cbd5e1;
  line-height: 1.7;
}

.contact-description {
  max-width: 42rem;
  margin: 1rem 0 0;
}

.contact-card {
  padding: 1.75rem;
  border-color: rgba(148, 163, 184, 0.14) !important;
  box-shadow: 0 24px 50px rgba(2, 6, 23, 0.35);
}

.contact-info-card {
  height: 100%;
}

.contact-info-card__label {
  margin: 0;
  color: #c084fc;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.contact-info-card__text {
  margin: 0.85rem 0 0;
}
</style>
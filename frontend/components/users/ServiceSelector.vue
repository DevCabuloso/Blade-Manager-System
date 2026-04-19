<template>
  <div>
    <v-row v-if="isLoading" dense>
      <v-col v-for="index in 6" :key="`service-skeleton-${index}`" cols="12" sm="6" xl="4">
        <v-skeleton-loader color="rgba(15, 23, 42, 0.85)" type="article" class="service-skeleton" />
      </v-col>
    </v-row>

    <v-row v-else-if="services.length" dense>
      <v-col v-for="service in services" :key="service.id" cols="12" sm="6" xl="4">
        <v-card color="rgba(15, 23, 42, 0.9)" rounded="xl" border class="service-card h-100">
          <v-card-text class="pa-5">
            <div class="service-card__header">
              <h2 class="service-card__title">
                {{ service.nome }}
              </h2>

              <v-chip color="primary" variant="tonal" rounded="lg" class="font-weight-bold">
                {{ formatCurrency(service.preco) }}
              </v-chip>
            </div>

            <p class="service-card__meta">
              Duração média:
              <span class="service-card__meta-highlight">{{ service.duracao_minutos }} min</span>
            </p>

            <AppButton block @click="$emit('select-service', service)">
              Agendar agora
            </AppButton>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <AppEmptyState
      v-else
      title="Nenhum servico disponivel no momento."
      message="Tente novamente em alguns instantes."
    />
  </div>
</template>

<script setup>
import AppButton from '@/components/ui/AppButton.vue';
import AppEmptyState from '@/components/ui/AppEmptyState.vue';
import { formatCurrency } from '@/utils/dateUtils.js';

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  services: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['select-service']);
</script>

<style scoped>
.service-card {
  border-color: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 20px 40px rgba(2, 6, 23, 0.45);
}

.service-skeleton {
  border-radius: 1.5rem;
}

.service-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.service-card__title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.2;
}

.service-card__meta {
  margin: 0 0 1.5rem;
  color: #cbd5e1;
  font-size: 0.92rem;
}

.service-card__meta-highlight {
  color: #c084fc;
  font-weight: 700;
}
</style>

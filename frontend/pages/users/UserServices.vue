<template>
  <div class="user-services-page safe-area-pb">
    <div class="user-services-glow user-services-glow--left"></div>
    <div class="user-services-glow user-services-glow--right"></div>
    <div class="user-services-glow user-services-glow--bottom"></div>

    <v-container class="user-services-container">
      <v-sheet rounded="xl" border color="rgba(15, 23, 42, 0.82)" class="user-services-hero">
        <div class="user-services-hero__content">
          <div>
            <p class="user-services-hero__eyebrow">Agendamento Online</p>
            <h1 class="user-services-hero__title">Escolha seu corte perfeito</h1>
            <p class="user-services-hero__subtitle">
              Selecione um servico, escolha data e horario, e confirme em poucos toques.
            </p>
          </div>

          <div class="user-services-hero__stats">
            <v-card rounded="xl" border color="rgba(15, 23, 42, 0.85)">
              <v-card-text>
                <p class="user-services-hero__stat-label">Servicos</p>
                <p class="user-services-hero__stat-value">{{ services.length }}</p>
              </v-card-text>
            </v-card>

            <v-card rounded="xl" border color="rgba(15, 23, 42, 0.85)">
              <v-card-text>
                <p class="user-services-hero__stat-label">Status</p>
                <p class="user-services-hero__stat-text">Pronto para agendar</p>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-sheet>

      <ServiceSelector
        :is-loading="isLoading"
        :services="services"
        @select-service="openCalendar"
      />

      <BookingConfirmationDialog
        v-model="showModal"
        :available-times="availableTimes"
        :blanks="blanks"
        :can-confirm-booking="canConfirmBooking"
        v-model:client-name="customerName"
        :current-month="currentMonth"
        :current-year="currentYear"
        :days-in-month="daysInMonth"
        :is-past-date="isPastDateInCurrentView"
        :is-submitting="isSubmitting"
        :month-label="monthLabel"
        :selected-date="selectedDate"
        :selected-display-date="selectedDisplayDate"
        :selected-service="selectedService"
        :selected-stage-label="selectedStageLabel"
        :selected-time="selectedTime"
        :week-days-short="weekDaysShort"
        @close="closeModal"
        @confirm-booking="confirmBooking"
        @next-month="nextMonth"
        @prev-month="prevMonth"
        @select-date="selectDate"
        @select-time="selectTime"
      />
    </v-container>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BookingConfirmationDialog from '@/components/users/BookingConfirmationDialog.vue';
import ServiceSelector from '@/components/users/ServiceSelector.vue';
import { useBookingFlow } from '@/composables/useBookingFlow.js';

const route = useRoute();
const router = useRouter();

const {
  availableTimes,
  blanks,
  canConfirmBooking,
  closeModal,
  confirmBooking,
  currentMonth,
  currentYear,
  customerName,
  daysInMonth,
  fetchInitialData,
  isLoading,
  isPastDateInCurrentView,
  isSubmitting,
  monthLabel,
  nextMonth,
  openCalendar,
  prevMonth,
  selectDate,
  selectedDate,
  selectedDisplayDate,
  selectedService,
  selectedStageLabel,
  selectedTime,
  selectTime,
  services,
  showModal,
  weekDaysShort,
} = useBookingFlow({
  profissionalId: route.params.profissionalId,
  router,
});

onMounted(fetchInitialData);
</script>

<style scoped>
.user-services-page {
  position: relative;
  min-height: 100vh;
  color: #f8fafc;
  background: linear-gradient(180deg, #020617 0%, #111827 55%, #020617 100%);
}

.user-services-glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(90px);
  pointer-events: none;
}

.user-services-glow--left {
  top: 2rem;
  left: -6rem;
  width: 18rem;
  height: 18rem;
  background: rgba(168, 85, 247, 0.12);
}

.user-services-glow--right {
  top: 0;
  right: 0;
  width: 20rem;
  height: 20rem;
  background: rgba(56, 189, 248, 0.1);
}

.user-services-glow--bottom {
  bottom: 0;
  left: 30%;
  width: 20rem;
  height: 20rem;
  background: rgba(168, 85, 247, 0.1);
}

.user-services-container {
  position: relative;
  width: min(1200px, 100%);
  padding: 1.5rem 1rem 2.5rem;
}

.user-services-hero {
  padding: 1.5rem;
  margin-bottom: 1.75rem;
  border-color: rgba(148, 163, 184, 0.14) !important;
  box-shadow: 0 30px 80px rgba(2, 6, 23, 0.42);
}

.user-services-hero__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-services-hero__eyebrow {
  display: inline-flex;
  margin: 0 0 0.75rem;
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(168, 85, 247, 0.32);
  color: #c084fc;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.user-services-hero__title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 900;
  line-height: 1.05;
}

.user-services-hero__subtitle {
  margin: 0.85rem 0 0;
  max-width: 42rem;
  color: #cbd5e1;
  line-height: 1.7;
}

.user-services-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.user-services-hero__stat-label {
  margin: 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

.user-services-hero__stat-value,
.user-services-hero__stat-text {
  margin: 0.35rem 0 0;
  font-weight: 800;
}

.user-services-hero__stat-value {
  color: #c084fc;
  font-size: 1.6rem;
}

.user-services-hero__stat-text {
  color: #d8b4fe;
}

@media (min-width: 960px) {
  .user-services-container {
    padding-top: 2rem;
  }

  .user-services-hero {
    padding: 2rem;
  }

  .user-services-hero__content {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }

  .user-services-hero__stats {
    min-width: 280px;
  }
}
</style>

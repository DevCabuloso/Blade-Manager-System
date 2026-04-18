<template>
  <AppDialog
    :model-value="modelValue"
    :max-width="1100"
    @update:model-value="handleDialogChange"
  >
    <v-row dense>
      <v-col cols="12" lg="4">
        <v-sheet rounded="xl" border color="rgba(15, 23, 42, 0.68)" class="booking-dialog__sidebar">
          <div class="booking-dialog__sidebar-header">
            <div>
              <p class="booking-dialog__eyebrow">Servico selecionado</p>
              <h3 class="booking-dialog__title">
                {{ selectedService?.nome || 'Agendamento' }}
              </h3>
            </div>

            <AppButton variant="text" @click="emit('close')">
              Fechar
            </AppButton>
          </div>

          <v-card color="rgba(15, 23, 42, 0.75)" rounded="xl" border>
            <v-card-text class="pa-4">
              <p class="booking-dialog__label">Valor</p>
              <p class="booking-dialog__price">
                {{ formatCurrency(selectedService?.preco) }}
              </p>
              <p class="booking-dialog__meta">
                Duracao:
                <span class="booking-dialog__meta-highlight">{{ selectedService?.duracao_minutos || 0 }} min</span>
              </p>
            </v-card-text>
          </v-card>

          <v-card color="rgba(168, 85, 247, 0.12)" rounded="xl" border>
            <v-card-text class="pa-4 booking-dialog__stage-card">
              <p class="booking-dialog__stage-title">Etapa atual</p>
              <p class="booking-dialog__stage-text">{{ selectedStageLabel }}</p>
            </v-card-text>
          </v-card>
        </v-sheet>
      </v-col>

      <v-col cols="12" lg="8">
        <v-sheet rounded="xl" border color="rgba(3, 7, 18, 0.72)" class="booking-dialog__content">
          <div class="booking-dialog__content-header">
            <h2 class="booking-dialog__content-title">Escolha data e horario</h2>

            <AppButton variant="secondary" @click="emit('close')">
              Cancelar
            </AppButton>
          </div>

          <BookingCalendar
            :current-month="currentMonth"
            :current-year="currentYear"
            :blanks="blanks"
            :days-in-month="daysInMonth"
            :is-past-date="isPastDate"
            :month-label="monthLabel"
            :selected-date="selectedDate"
            :week-days-short="weekDaysShort"
            @next-month="emit('next-month')"
            @prev-month="emit('prev-month')"
            @select-date="emit('select-date', $event)"
          />

          <TimeSlots
            :available-times="availableTimes"
            :selected-date-label="selectedDisplayDate"
            :selected-time="selectedTime"
            @select-time="emit('select-time', $event)"
          />

          <div v-if="canConfirmBooking" class="booking-dialog__actions">
            <AppButton :loading="isSubmitting" block @click="emit('confirm-booking')">
              Confirmar agendamento
            </AppButton>

            <AppButton variant="secondary" block @click="emit('close')">
              Cancelar
            </AppButton>
          </div>
        </v-sheet>
      </v-col>
    </v-row>
  </AppDialog>
</template>

<script setup>
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import BookingCalendar from '@/components/users/BookingCalendar.vue';
import TimeSlots from '@/components/users/TimeSlots.vue';
import { formatCurrency } from '@/utils/dateUtils.js';

const props = defineProps({
  availableTimes: {
    type: Array,
    default: () => [],
  },
  blanks: {
    type: Array,
    default: () => [],
  },
  canConfirmBooking: {
    type: Boolean,
    default: false,
  },
  currentMonth: {
    type: Number,
    required: true,
  },
  currentYear: {
    type: Number,
    required: true,
  },
  daysInMonth: {
    type: Array,
    default: () => [],
  },
  isPastDate: {
    type: Function,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  monthLabel: {
    type: String,
    default: '',
  },
  selectedDate: {
    type: Number,
    default: null,
  },
  selectedDisplayDate: {
    type: String,
    default: '',
  },
  selectedService: {
    type: Object,
    default: null,
  },
  selectedStageLabel: {
    type: String,
    default: '',
  },
  selectedTime: {
    type: String,
    default: '',
  },
  weekDaysShort: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  'close',
  'confirm-booking',
  'next-month',
  'prev-month',
  'select-date',
  'select-time',
  'update:modelValue',
]);

const handleDialogChange = (value) => {
  emit('update:modelValue', value);

  if (!value) {
    emit('close');
  }
};
</script>

<style scoped>
.booking-dialog__sidebar,
.booking-dialog__content {
  padding: 1.25rem;
}

.booking-dialog__sidebar {
  display: grid;
  gap: 1rem;
}

.booking-dialog__sidebar-header,
.booking-dialog__content-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.booking-dialog__eyebrow {
  margin: 0;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.booking-dialog__title,
.booking-dialog__content-title {
  margin: 0.55rem 0 0;
  color: #f8fafc;
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 900;
}

.booking-dialog__label,
.booking-dialog__meta {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.92rem;
}

.booking-dialog__price {
  margin: 0.55rem 0;
  color: #4ade80;
  font-size: 2rem;
  font-weight: 900;
}

.booking-dialog__meta-highlight {
  color: #c084fc;
  font-weight: 700;
}

.booking-dialog__stage-card {
  color: #ffedd5;
}

.booking-dialog__stage-title {
  margin: 0;
  font-weight: 700;
}

.booking-dialog__stage-text {
  margin: 0.35rem 0 0;
  color: #c084fc;
}

.booking-dialog__actions {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

@media (min-width: 700px) {
  .booking-dialog__actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

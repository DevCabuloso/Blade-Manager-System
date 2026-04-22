<template>
  <AppDialog
    :model-value="modelValue"
    :max-width="1320"
    viewport-width="94vw"
    @update:model-value="handleDialogChange"
  >
    <div class="booking-dialog__content">
      <div class="booking-dialog__content-header">
        <div>
          <h2 class="booking-dialog__content-title">Escolha data e horário</h2>
          <p class="booking-dialog__meta-line">
            {{ selectedService?.nome || 'Agendamento' }}
            <span class="booking-dialog__meta-separator">•</span>
            {{ formatCurrency(selectedService?.preco) }}
            <span class="booking-dialog__meta-separator">•</span>
            {{ selectedService?.duracao_minutos || 0 }} min
          </p>
        </div>

        <AppButton variant="danger" @click="emit('close')">
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

      <AppField
        :model-value="clientName"
        label="Seu nome"
        placeholder="Digite o nome para o barbeiro identificar"
        class="booking-dialog__name-field"
        @update:model-value="emit('update:clientName', $event)"
      />

      <div v-if="canConfirmBooking" class="booking-dialog__actions">
        <AppButton :loading="isSubmitting" block @click="emit('confirm-booking')">
          Confirmar agendamento
        </AppButton>

        <AppButton variant="danger" block @click="emit('close')">
          Cancelar
        </AppButton>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import AppButton from '@/components/ui/AppButton.vue';
import AppDialog from '@/components/ui/AppDialog.vue';
import AppField from '@/components/ui/AppField.vue';
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
  clientName: {
    type: String,
    default: '',
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
  'update:clientName',
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
.booking-dialog__content {
  padding: 1.25rem 1.35rem;
}

:deep(.app-dialog__content) {
  padding: 0.6rem !important;
}

.booking-dialog__content-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
}

.booking-dialog__content-title {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(1.35rem, 2vw, 1.8rem);
  font-weight: 900;
}

.booking-dialog__meta-line {
  margin: 0.4rem 0 0;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.booking-dialog__meta-separator {
  margin: 0 0.35rem;
  color: #94a3b8;
}

.booking-dialog__actions {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.75rem;
}

.booking-dialog__name-field {
  margin-top: 1.25rem;
}

@media (max-width: 959px) {
  .booking-dialog__content {
    padding: 0.7rem;
  }

  .booking-dialog__content-header {
    margin-bottom: 0.7rem;
  }

  .booking-dialog__meta-line {
    font-size: 0.82rem;
  }
}

@media (min-width: 700px) {
  .booking-dialog__actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

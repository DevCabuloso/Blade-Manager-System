<template>
  <div>
    <v-sheet rounded="xl" border color="rgba(15, 23, 42, 0.65)" class="booking-calendar-toolbar">
      <AppButton class="booking-calendar-toolbar__nav" variant="secondary" size="small" @click="$emit('prev-month')">
        &lt;
      </AppButton>

      <h3 class="booking-calendar-title">
        {{ monthLabel }}
      </h3>

      <AppButton class="booking-calendar-toolbar__nav" variant="secondary" size="small" @click="$emit('next-month')">
        &gt;
      </AppButton>
    </v-sheet>

    <v-calendar
      :model-value="currentViewDate"
      type="month"
      locale="pt-BR"
      :weekday-format="formatWeekdayLabel"
      color="primary"
      :short-weekdays="isMobile"
      class="booking-calendar"
      @click:date="handleCalendarClick"
    >
      <template #day-label="day">
        <button
          type="button"
          class="booking-calendar-day"
          :class="dayClass(day.date, day.day)"
          :disabled="isDisabledDate(day.date, day.day)"
          @click.stop="selectDate(day.date, day.day)"
        >
          {{ day.day }}
        </button>
      </template>

      <template #day="day">
        <button
          type="button"
          class="booking-calendar-day-body"
          :class="{ 'booking-calendar-day-body--selected': isSelectedDate(day.day) && isCurrentViewDate(day.date) }"
          :disabled="isDisabledDate(day.date, day.day)"
          @click.stop="selectDate(day.date, day.day)"
        />
      </template>
    </v-calendar>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import AppButton from '@/components/ui/AppButton.vue';

const props = defineProps({
  currentMonth: {
    type: Number,
    required: true,
  },
  currentYear: {
    type: Number,
    required: true,
  },
  blanks: {
    type: Array,
    default: () => [],
  },
  daysInMonth: {
    type: Array,
    default: () => [],
  },
  isPastDate: {
    type: Function,
    required: true,
  },
  monthLabel: {
    type: String,
    default: '',
  },
  selectedDate: {
    type: Number,
    default: null,
  },
  weekDaysShort: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['next-month', 'prev-month', 'select-date']);
const { mdAndDown } = useDisplay();
const isMobile = mdAndDown;

const currentViewKey = computed(() => `${props.currentYear}-${String(props.currentMonth + 1).padStart(2, '0')}`);
const currentViewDate = computed(() => `${currentViewKey.value}-01`);
const todayKey = new Date().toISOString().slice(0, 10);

const isCurrentViewDate = (date) => date.startsWith(currentViewKey.value);

const isDisabledDate = (date, day) => !isCurrentViewDate(date) || props.isPastDate(day) || date < todayKey;

const isSelectedDate = (day) => props.selectedDate === day;

const dayClass = (date, day) => ({
  'booking-calendar-day--disabled': isDisabledDate(date, day),
  'booking-calendar-day--selected': isSelectedDate(day) && isCurrentViewDate(date),
  'booking-calendar-day--outside': !isCurrentViewDate(date),
  'booking-calendar-day--default': !isDisabledDate(date, day) && !isSelectedDate(day),
});

const selectDate = (date, day) => {
  if (isDisabledDate(date, day)) return;
  emit('select-date', day);
};

const handleCalendarClick = (_, day) => {
  if (!day?.date) return;
  selectDate(day.date, day.day);
};

const formatWeekdayLabel = (value) => {
  const rawValue =
    value instanceof Date
      ? value
      : value?.date || value?.isoDate || value?.value || value;

  const date = rawValue instanceof Date ? rawValue : new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return String(value?.label || value?.weekday || '').replace('-feira', '').replace('.', '').trim();
  }

  return date
    .toLocaleDateString('pt-BR', { weekday: isMobile.value ? 'short' : 'long' })
    .replace('-feira', '')
    .replace('.', '')
    .trim();
};
</script>

<style scoped>
.booking-calendar-toolbar {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr) 2.75rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1.25rem;
}

.booking-calendar-toolbar__nav {
  width: 2.75rem;
  min-width: 2.75rem;
  justify-self: center;
}

.booking-calendar-title {
  margin: 0;
  color: #c084fc;
  font-size: clamp(1rem, 2.2vw, 1.25rem);
  font-weight: 900;
  text-align: center;
  line-height: 1.2;
}

.booking-calendar {
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 1.15rem;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.86), rgba(2, 6, 23, 0.72));
}

.booking-calendar :deep(.v-calendar-weekly__head-weekday) {
  padding: 0.55rem 0.2rem;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;
}

.booking-calendar :deep(.v-calendar-weekly__day) {
  min-height: 4.25rem;
  border-color: rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.56);
}

.booking-calendar :deep(.v-calendar-weekly__day.v-outside) {
  background: rgba(15, 23, 42, 0.26);
}

.booking-calendar :deep(.v-calendar-weekly__day-label) {
  margin: 0;
  padding: 0.35rem 0.35rem 0;
}

.booking-calendar-day {
  width: 2.2rem;
  height: 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  font-size: 0.92rem;
  font-weight: 700;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.booking-calendar-day-body {
  width: 100%;
  min-height: 1.8rem;
  background: transparent;
  border: 0;
}

.booking-calendar-day-body--selected {
  background: linear-gradient(180deg, rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0));
}

.booking-calendar-day--disabled {
  background: rgba(15, 23, 42, 0.48);
  color: #475569;
  cursor: not-allowed;
}

.booking-calendar-day--outside {
  background: rgba(15, 23, 42, 0.32);
  color: #475569;
  border-color: rgba(148, 163, 184, 0.08);
}

.booking-calendar-day--selected {
  background: linear-gradient(135deg, #a855f7, #9333ea);
  border-color: rgba(251, 146, 60, 0.6);
  color: #fff7ed;
  box-shadow: 0 18px 32px rgba(147, 51, 234, 0.24);
}

.booking-calendar-day--default {
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
}

.booking-calendar-day--default:hover {
  background: rgba(168, 85, 247, 0.14);
  border-color: rgba(168, 85, 247, 0.28);
  color: #fff7ed;
  transform: translateY(-1px);
}

@media (min-width: 640px) {
  .booking-calendar :deep(.v-calendar-weekly__day) {
    min-height: 4.7rem;
  }

  .booking-calendar-day {
    width: 2.35rem;
    height: 2.35rem;
  }
}

@media (max-width: 599px) {
  .booking-calendar-toolbar {
    grid-template-columns: 2.5rem minmax(0, 1fr) 2.5rem;
    gap: 0.5rem;
    padding: 0.8rem 0.75rem;
  }

  .booking-calendar-toolbar__nav {
    width: 2.5rem;
    min-width: 2.5rem;
  }

  .booking-calendar-title {
    font-size: 0.96rem;
  }

  .booking-calendar :deep(.v-calendar-weekly__head-weekday) {
    font-size: 0.64rem;
  }

  .booking-calendar :deep(.v-calendar-weekly__day) {
    min-height: 3.5rem;
  }

  .booking-calendar-day {
    width: 1.9rem;
    height: 1.9rem;
    font-size: 0.82rem;
  }
}
</style>

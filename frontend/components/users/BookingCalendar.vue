<template>
  <div>
    <div class="booking-calendar-toolbar">
      <AppButton class="booking-calendar-toolbar__nav" variant="secondary" size="small" @click="$emit('prev-month')">
        &lt;
      </AppButton>

      <h3 class="booking-calendar-title">{{ monthLabel }}</h3>

      <AppButton class="booking-calendar-toolbar__nav" variant="secondary" size="small" @click="$emit('next-month')">
        &gt;
      </AppButton>
    </div>

    <div class="agenda-calendar-grid">
      <div v-for="day in weekLabels" :key="day" class="agenda-weekday">
        {{ day }}
      </div>

      <button
        v-for="day in calendarDays"
        :key="day.date"
        class="agenda-day"
        :class="bookingDayClass(day)"
        :disabled="!day.isCurrentMonth || isPastDate(day.day)"
        :title="dayTitle(day)"
        :aria-label="dayTitle(day)"
        @click="selectDate(day)"
      >
        <span class="agenda-day__number" :class="{ 'agenda-day__number--today': day.isToday }">
          {{ day.day }}
        </span>
      </button>
    </div>
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

const weekLabels = computed(() => (isMobile.value
  ? (props.weekDaysShort.length ? props.weekDaysShort : ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'])
  : ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']));

const calendarDays = computed(() => {
  const year = props.currentYear;
  const month = props.currentMonth + 1;
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const today = new Date().toISOString().split('T')[0];
  const days = [];
  const leadingDays = firstDay.getDay();

  for (let i = leadingDays - 1; i >= 0; i -= 1) {
    const prevDate = new Date(year, month - 1, -i);
    days.push({
      date: prevDate.toISOString().split('T')[0],
      day: prevDate.getDate(),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  for (let i = 1; i <= lastDay.getDate(); i += 1) {
    const date = new Date(year, month - 1, i).toISOString().split('T')[0];
    days.push({
      date,
      day: i,
      isCurrentMonth: true,
      isToday: date === today,
    });
  }

  const trailingDays = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= trailingDays; i += 1) {
    const nextDate = new Date(year, month, i);
    days.push({
      date: nextDate.toISOString().split('T')[0],
      day: nextDate.getDate(),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
});

const bookingDayClass = (day) => ({
  'agenda-day--current': day.isCurrentMonth,
  'agenda-day--outside': !day.isCurrentMonth,
  'agenda-day--selected': day.isCurrentMonth && props.selectedDate === day.day,
});

const dayTitle = (day) => {
  const [year, month, date] = day.date.split('-');
  const baseLabel = `${date}/${month}/${year}`;

  if (!day.isCurrentMonth) {
    return `${baseLabel} - fora do mes atual`;
  }

  if (props.isPastDate(day.day)) {
    return `${baseLabel} - indisponivel`;
  }

  return `${baseLabel} - disponivel`;
};

const selectDate = (day) => {
  if (!day.isCurrentMonth || props.isPastDate(day.day)) return;
  emit('select-date', day.day);
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
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.65);
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
}

.agenda-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.4rem;
}

.agenda-weekday {
  padding: 0.75rem 0.2rem;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-align: center;
  text-transform: uppercase;
}

.agenda-day {
  position: relative;
  min-height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-color: rgba(148, 163, 184, 0.08);
  background: rgba(15, 23, 42, 0.52);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 0.95rem;
  color: #e2e8f0;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.agenda-day:hover {
  background: rgba(168, 85, 247, 0.14);
  border-color: rgba(168, 85, 247, 0.25);
  transform: translateY(-1px);
}

.agenda-day__number {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 800;
}

.agenda-day__number--today {
  background: rgba(255, 255, 255, 0.14);
}

.agenda-day--outside {
  background: rgba(15, 23, 42, 0.38);
  color: #64748b;
  cursor: not-allowed;
}

.agenda-day--selected {
  background: linear-gradient(135deg, #a855f7, #9333ea);
  border-color: rgba(251, 146, 60, 0.6);
  color: #fff7ed;
  box-shadow: 0 14px 28px rgba(147, 51, 234, 0.22);
}

@media (max-width: 959px) {
  .agenda-day {
    min-height: 3.35rem;
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

  .agenda-weekday {
    padding-top: 0;
    font-size: 0.62rem;
    letter-spacing: 0.03em;
  }

  .agenda-day {
    min-height: 2.95rem;
    aspect-ratio: 1;
    border-radius: 0.8rem;
  }

  .agenda-day__number {
    width: 1.55rem;
    height: 1.55rem;
    font-size: 0.8rem;
  }
}
</style>

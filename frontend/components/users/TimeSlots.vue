<template>
  <div v-if="selectedDateLabel" class="time-slots-block">
    <h4 class="time-slots-title">
      Horarios para {{ selectedDateLabel }}
    </h4>

    <v-row v-if="availableTimes.length" dense>
      <v-col v-for="time in availableTimes" :key="time" cols="6" sm="4" md="3">
        <v-btn
          block
          rounded="lg"
          :variant="selectedTime === time ? 'flat' : 'tonal'"
          color="primary"
          class="time-slot-button"
          :class="selectedTime === time ? 'time-slot-button--active' : 'time-slot-button--idle'"
          @click="$emit('select-time', time)"
        >
          {{ time }}
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-else type="warning" variant="tonal" rounded="xl">
      Não há horários disponíveis para este dia.
    </v-alert>
  </div>
</template>

<script setup>
defineProps({
  availableTimes: {
    type: Array,
    default: () => [],
  },
  selectedDateLabel: {
    type: String,
    default: '',
  },
  selectedTime: {
    type: String,
    default: '',
  },
});

defineEmits(['select-time']);
</script>

<style scoped>
.time-slots-block {
  margin-top: 1.75rem;
}

.time-slots-title {
  margin: 0 0 0.85rem;
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.time-slot-button {
  min-height: 38px;
  font-weight: 700;
  font-size: 0.9rem;
}

.time-slot-button--active {
  box-shadow: 0 14px 28px rgba(147, 51, 234, 0.22);
}

.time-slot-button--idle {
  background: rgba(88, 28, 135, 0.18) !important;
  color: #ede9fe !important;
}
</style>

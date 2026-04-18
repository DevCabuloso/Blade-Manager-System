<template>
  <v-btn
    :block="block"
    :color="resolvedColor"
    :disabled="disabled"
    :loading="loading"
    :type="type"
    :variant="resolvedVariant"
    :rounded="rounded"
    :size="size"
    :prepend-icon="prependIcon"
    :append-icon="appendIcon"
    :class="['app-button', `app-button--${resolvedTone}`, 'text-none font-weight-bold']"
  >
    <slot />
  </v-btn>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
  },
  color: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'button',
  },
  size: {
    type: String,
    default: 'small',
  },
  rounded: {
    type: String,
    default: 'xl',
  },
  block: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  prependIcon: {
    type: String,
    default: undefined,
  },
  appendIcon: {
    type: String,
    default: undefined,
  },
});

const variantMap = {
  primary: { color: 'primary', variant: 'flat', tone: 'primary' },
  secondary: { color: 'primary', variant: 'flat', tone: 'secondary' },
  danger: { color: 'primary', variant: 'flat', tone: 'secondary' },
  success: { color: 'primary', variant: 'flat', tone: 'primary' },
  text: { color: 'primary', variant: 'text', tone: 'text' },
  outlined: { color: 'primary', variant: 'outlined', tone: 'outlined' },
};

const resolvedColor = computed(() => variantMap[props.variant]?.color || 'primary');
const resolvedVariant = computed(() => variantMap[props.variant]?.variant || 'flat');
const resolvedTone = computed(() => variantMap[props.variant]?.tone || 'primary');
</script>

<style scoped>
.app-button {
  width: auto;
  max-width: 100%;
  padding-inline: 0.9rem;
  letter-spacing: 0;
  min-height: 38px;
  font-size: 0.92rem;
  flex: 0 1 auto;
  transition: transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease;
}

.app-button :deep(.v-btn__content) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 0.92rem;
  line-height: 1.1;
  text-align: center;
  white-space: normal;
}

.app-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
}

.app-button--primary {
  background: linear-gradient(135deg, #a855f7, #9333ea) !important;
  color: #faf5ff !important;
  box-shadow: 0 18px 36px rgba(147, 51, 234, 0.24);
}

.app-button.v-btn--size-small {
  min-height: 36px;
  padding-inline: 0.75rem;
}

.app-button--secondary {
  background: linear-gradient(135deg, rgba(88, 28, 135, 0.94), rgba(76, 29, 149, 0.94)) !important;
  color: #f5f3ff !important;
  border: 1px solid rgba(196, 181, 253, 0.18) !important;
  box-shadow: 0 12px 28px rgba(46, 16, 101, 0.2);
}

.app-button--text {
  padding-inline: 0.3rem;
  color: #c084fc !important;
}

.app-button--outlined {
  color: #c084fc !important;
  border-color: rgba(168, 85, 247, 0.4) !important;
  background: rgba(88, 28, 135, 0.12) !important;
}

.app-button.v-btn--disabled {
  filter: none;
  transform: none;
}

.app-button.v-btn--block {
  width: 100%;
  max-width: 100%;
}
</style>

<template>
  <component
    :is="componentType"
    :model-value="modelValue"
    :items="items"
    :label="label"
    :type="type"
    :placeholder="placeholder"
    :required="required"
    :autocomplete="autocomplete"
    :variant="variant"
    :density="density"
    :color="color"
    :disabled="disabled"
    :readonly="readonly"
    :clearable="clearable"
    :hint="hint"
    :persistent-hint="persistentHint"
    :hide-details="hideDetails"
    :messages="messages"
    :rules="rules"
    :error="error"
    :error-messages="errorMessages"
    :multiple="multiple"
    :rows="rows"
    :item-title="itemTitle"
    :item-value="itemValue"
    :base-color="baseColor"
    class="app-field"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number, Array, Object, Boolean],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  fieldType: {
    type: String,
    default: 'text',
  },
  items: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  autocomplete: {
    type: String,
    default: undefined,
  },
  variant: {
    type: String,
    default: 'outlined',
  },
  density: {
    type: String,
    default: 'comfortable',
  },
  color: {
    type: String,
    default: 'primary',
  },
  baseColor: {
    type: String,
    default: 'grey-darken-1',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: false,
  },
  hint: {
    type: String,
    default: '',
  },
  persistentHint: {
    type: Boolean,
    default: false,
  },
  hideDetails: {
    type: [Boolean, String],
    default: 'auto',
  },
  messages: {
    type: [Array, String],
    default: () => [],
  },
  rules: {
    type: Array,
    default: () => [],
  },
  error: {
    type: Boolean,
    default: false,
  },
  errorMessages: {
    type: [Array, String],
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: [String, Number],
    default: 3,
  },
  itemTitle: {
    type: String,
    default: 'title',
  },
  itemValue: {
    type: String,
    default: 'value',
  },
});

defineEmits(['update:modelValue']);

const componentType = computed(() => {
  if (props.fieldType === 'select') {
    return 'v-select';
  }

  if (props.fieldType === 'textarea') {
    return 'v-textarea';
  }

  return 'v-text-field';
});
</script>

<style scoped>
.app-field :deep(.v-field) {
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.72);
}

.app-field :deep(.v-field__input),
.app-field :deep(.v-label),
.app-field :deep(input) {
  color: #f8fafc;
}
</style>

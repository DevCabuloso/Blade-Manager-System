<template>
  <AppConfirmDialog
    :model-value="true"
    :title="title"
    :message="message"
    @cancel="$emit('cancel')"
    @confirm="$emit('confirm')"
  />
</template>

<script setup>
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue';

defineProps({
  title: {
    type: String,
    default: 'Confirmação',
  },
  message: {
    type: String,
    default: '',
  },
});

defineEmits(['confirm', 'cancel']);
</script>

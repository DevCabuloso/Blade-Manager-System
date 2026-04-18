import { computed, ref } from 'vue';

const pendingRequests = ref(0);

export const isGlobalLoading = computed(() => pendingRequests.value > 0);

export const startLoading = () => {
  pendingRequests.value += 1;
};

export const stopLoading = () => {
  pendingRequests.value = Math.max(0, pendingRequests.value - 1);
};

export const resetLoading = () => {
  pendingRequests.value = 0;
};

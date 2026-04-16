<template>
    <div class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
        <h2 class="text-lg font-semibold mb-4 text-gray-800">{{ title }}</h2>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <div class="flex justify-center gap-4">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            @click="$emit('confirm')"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps(['title', 'message'])
  defineEmits(['confirm', 'cancel'])
  </script>
  
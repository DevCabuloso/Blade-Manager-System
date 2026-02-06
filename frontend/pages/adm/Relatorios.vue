<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Relatórios por Profissional</h1>

    
    <div class="flex gap-4 mb-6">
      <input
        v-model="filtroProfissional"
        type="text"
        placeholder="Digite nome ou e-mail do profissional"
        class="border p-2 rounded flex-1"
      />
      <button
        @click="buscarStats"
        class="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Buscar
      </button>
    </div>

    
    <div v-if="profissionalEncontrado" class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-white shadow rounded p-4 text-center">
        <h2 class="text-lg font-semibold">Usuários</h2>
        <p class="text-2xl font-bold">{{ stats.usuarios }}</p>
      </div>
      <div class="bg-white shadow rounded p-4 text-center">
        <h2 class="text-lg font-semibold">Barbearias</h2>
        <p class="text-2xl font-bold">{{ stats.barbearias }}</p>
      </div>
      <div class="bg-white shadow rounded p-4 text-center">
        <h2 class="text-lg font-semibold">Agendamentos</h2>
        <p class="text-2xl font-bold">{{ stats.agendamentos }}</p>
      </div>
      <div class="bg-white shadow rounded p-4 text-center">
        <h2 class="text-lg font-semibold">Serviços</h2>
        <p class="text-2xl font-bold">{{ stats.servicos }}</p>
      </div>
    </div>

    <div v-else class="text-gray-500">Digite um profissional e clique em "Buscar" para ver os relatórios.</div>

    
    <div v-if="profissionalEncontrado" class="flex gap-4 items-center mt-4">
      <select v-model="filtroPeriodo" class="border p-2 rounded" @change="buscarStats">
        <option value="dia">Dia</option>
        <option value="semana">Semana</option>
        <option value="mes">Mês</option>
        <option value="custom">Personalizado</option>
      </select>
      <button class="bg-green-600 text-white px-4 py-2 rounded" @click="exportarPDF">
        📥 Exportar PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const filtroProfissional = ref("");
const filtroPeriodo = ref("mes");
const stats = ref({
  usuarios: 0,
  barbearias: 0,
  agendamentos: 0,
  servicos: 0
});
const profissionalEncontrado = ref(false);

const token = sessionStorage.getItem("token"); 

const buscarStats = async () => {
  if (!filtroProfissional.value.trim()) {
    alert("Digite o nome ou e-mail do profissional!");
    return;
  }

  try {
    const { data } = await axios.get(`http://localhost:8000/api/relatorios?profissional=${filtroProfissional.value}&periodo=${filtroPeriodo.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    stats.value = data;
    profissionalEncontrado.value = true;
  } catch (err) {
    console.error(err);
    alert("Profissional não encontrado ou erro ao buscar relatórios");
    profissionalEncontrado.value = false;
  }
};

const exportarPDF = () => {
  if (!profissionalEncontrado.value) {
    alert("Busque um profissional primeiro!");
    return;
  }
  alert("Gerar PDF do relatório...");
};
</script>

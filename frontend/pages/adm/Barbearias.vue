<template>
  <div class="p-6 bg-white rounded-2xl shadow border">
    <h1 class="text-2xl font-bold mb-4">💈 Gestão de Barbearias</h1>

    
    <div class="flex gap-4 mb-4">
      <input
        v-model="filtroNome"
        type="text"
        placeholder="Buscar por nome"
        class="border p-2 rounded flex-1"
      />
      <button @click="buscarBarbearias" class="bg-blue-600 text-white px-4 py-2 rounded">Buscar</button>
      
      <button @click="abrirModal()" class="bg-green-600 text-white px-4 py-2 rounded">+ Adicionar</button>
    </div>

    
    <table class="w-full border-collapse border border-gray-200">
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2">ID</th>
          <th class="border px-4 py-2">Nome</th>
          <th class="border px-4 py-2">E-mail</th>
          <th class="border px-4 py-2">Telefone</th>
          <th class="border px-4 py-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="barbearia in barbearias" :key="barbearia.id">
          <td class="border px-4 py-2">{{ barbearia.id }}</td>
          <td class="border px-4 py-2">{{ barbearia.nome_usuario }}</td>
          <td class="border px-4 py-2">{{ barbearia.email }}</td>
          <td class="border px-4 py-2">{{ barbearia.telefone }}</td>
          <td class="border px-4 py-2 flex gap-2">
            <button @click="editarBarbearia(barbearia)" class="bg-yellow-500 text-white px-2 py-1 rounded">Editar</button>
            <button @click="excluirBarbearia(barbearia.id)" class="bg-red-600 text-white px-2 py-1 rounded">Excluir</button>
          </td>
        </tr>
      </tbody>
    </table>

    
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white p-6 rounded shadow w-96">
        <h2 class="text-xl font-bold mb-4">{{ editando ? 'Editar' : 'Cadastrar' }} Barbearia</h2>
        <input v-model="form.nome_usuario" placeholder="Nome" class="border p-2 w-full mb-2 rounded" />
        <input v-model="form.email" placeholder="E-mail" class="border p-2 w-full mb-2 rounded" />
        <input v-model="form.senha" type="password" placeholder="Senha" v-if="!editando" class="border p-2 w-full mb-2 rounded" />
        <input v-model="form.telefone" placeholder="Telefone" class="border p-2 w-full mb-4 rounded" />

        <div class="flex justify-end gap-2">
          <button @click="showModal = false" class="px-4 py-2 rounded border">Cancelar</button>
          <button @click="salvarBarbearia" class="px-4 py-2 rounded bg-green-600 text-white">{{ editando ? 'Atualizar' : 'Cadastrar' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      barbearias: [],
      filtroNome: '',
      showModal: false,
      editando: false,
      form: {
        id: null,
        nome_usuario: '',
        email: '',
        senha: '',
        telefone: '',
      },
      token: sessionStorage.getItem('token'),
    };
  },
  mounted() {
    this.buscarBarbearias();
  },
  methods: {
    async buscarBarbearias() {
      try {
        const { data } = await axios.get('http://localhost:8000/api/usuarios/profissionais/all', {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.barbearias = this.filtroNome
          ? data.filter(b => b.nome_usuario.toLowerCase().includes(this.filtroNome.toLowerCase()))
          : data;
      } catch (err) {
        console.error(err);
        alert('Erro ao buscar barbearias');
      }
    },
    abrirModal(barbearia = null) {
      if (barbearia) {
        this.editando = true;
        this.form = { ...barbearia, senha: '' };
      } else {
        this.editando = false;
        this.form = { id: null, nome_usuario: '', email: '', senha: '', telefone: '' };
      }
      this.showModal = true;
    },
    editarBarbearia(barbearia) {
      this.abrirModal(barbearia);
    },
    async excluirBarbearia(id) {
      if (!confirm('Deseja realmente excluir essa barbearia?')) return;
      try {
        await axios.delete(`http://localhost:8000/api/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        alert('Barbearia excluída!');
        this.buscarBarbearias();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir barbearia');
      }
    },
    async salvarBarbearia() {
  try {
    if (this.editando) {
      await axios.put(`http://localhost:8000/api/usuarios/${this.form.id}`, {
        nome_usuario: this.form.nome_usuario,
        email: this.form.email,
        telefone: this.form.telefone,
      }, { headers: { Authorization: `Bearer ${this.token}` } });
      alert('Barbearia atualizada!');
    } else {
      await axios.post('http://localhost:8000/api/usuarios', {
        nome_usuario: this.form.nome_usuario,
        email: this.form.email,
        senha: this.form.senha,
        telefone: this.form.telefone,
        tipo_usuario: 'barbeiro',
      }, { headers: { Authorization: `Bearer ${this.token}` } });
      alert('Barbearia cadastrada!');
    }
    this.showModal = false;
    this.form = { id: null, nome_usuario: '', email: '', senha: '', telefone: '' };
    this.buscarBarbearias();
  } catch (err) {
    console.error(err);
    
    const msg = err.response?.data?.message || 'Erro ao salvar barbearia';
    alert(msg);
  }
},
  },
};
</script>
 
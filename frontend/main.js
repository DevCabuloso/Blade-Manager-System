
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './assets/tailwind.css'
import axios from 'axios'

// Configurar baseURL do axios dinamicamente
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
axios.defaults.baseURL = backendURL

const app = createApp(App)
app.use(router).mount('#app')
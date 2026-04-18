import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import vuetify from './plugins/vuetify.js'
import './style.css'
import axios from 'axios'
import Toast, { POSITION, useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { resetLoading, startLoading, stopLoading } from './stores/loadingState.js'
import { clearClientAuthState } from './services/authService.js'
import { routeRequiresAuth } from './router/authGuard.js'

// Configurar baseURL do axios dinamicamente
const backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
axios.defaults.baseURL = backendURL

const app = createApp(App)

const loadingRoutes = new Set(['/agenda', '/services', '/horarios', '/profile'])
const shouldUsePageLoader = (path) => loadingRoutes.has(path)

const redirectToLoginAfterAuthFailure = () => {
	const currentRoute = router.currentRoute.value

	if (!routeRequiresAuth(currentRoute)) {
		return
	}

	clearClientAuthState()

	if (currentRoute.path !== '/login') {
		router.push({ path: '/login' })
	}
}

router.beforeEach((to, from, next) => {
	if (shouldUsePageLoader(to.path)) {
		startLoading()
	}
	next()
})

router.afterEach((to) => {
	if (shouldUsePageLoader(to.path)) {
		// Pequeno atraso para evitar efeito de flicker em trocas muito rapidas.
		setTimeout(() => stopLoading(), 120)
		return
	}

	resetLoading()
})

router.onError(() => {
	resetLoading()
})

axios.interceptors.request.use(
	(config) => {
		const currentPath = router.currentRoute.value.path
		const shouldTrackRequest = shouldUsePageLoader(currentPath)
		config.__usePageLoader = shouldTrackRequest

		if (shouldTrackRequest) {
			startLoading()
		}

		return config
	},
	(error) => {
		if (error?.config?.__usePageLoader) {
			stopLoading()
		}

		return Promise.reject(error)
	}
)

axios.interceptors.response.use(
	(response) => {
		if (response?.config?.__usePageLoader) {
			stopLoading()
		}
		return response
	},
	(error) => {
		if (error?.config?.__usePageLoader) {
			stopLoading()
		}

		const status = error?.response?.status
		if (status === 401 || status === 403) {
			redirectToLoginAfterAuthFailure()
		}

		return Promise.reject(error)
	}
)

app.use(Toast, {
	position: POSITION.TOP_RIGHT,
	timeout: 3500,
	closeOnClick: true,
	pauseOnFocusLoss: true,
	pauseOnHover: true,
	draggable: true,
	hideProgressBar: false,
})

// Fallback global: converte alerts existentes em toast sem refatorar páginas agora.
const toast = useToast()
window.alert = (message) => {
	const text = String(message || 'Aviso')
	const normalized = text.toLowerCase()

	if (normalized.includes('erro') || normalized.includes('inval') || normalized.includes('incorreta')) {
		toast.error(text)
		return
	}

	if (normalized.includes('sucesso') || normalized.includes('confirmado') || normalized.includes('atualizado')) {
		toast.success(text)
		return
	}

	toast.info(text)
}

app.use(vuetify)
app.use(router).mount('#app')

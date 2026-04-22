import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
	components,
	directives,
	display: {
		mobileBreakpoint: 'md',
	},
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: {
			mdi,
		},
	},
	theme: {
		defaultTheme: 'bladeDark',
		themes: {
			bladeDark: {
				dark: true,
				colors: {
					background: '#020617',
					surface: '#0f172a',
						primary: '#a855f7',
					secondary: '#334155',
					success: '#22c55e',
					error: '#ef4444',
					warning: '#f59e0b',
					info: '#38bdf8',
				},
			},
		},
	},
})

export default vuetify

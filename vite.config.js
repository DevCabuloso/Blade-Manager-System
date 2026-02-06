import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const isDocker = process.env.DOCKER === 'true' || process.env.HOSTNAME?.includes('docker');
const backendHost = isDocker ? 'http://backend:8000' : 'http://localhost:8000';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './frontend'),
    },
  },
  server: { 
    open: true,
    host: true,
    port: 5173,

    proxy: {
      '/api': {
        target: backendHost,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (err.code !== 'ECONNREFUSED') console.error('Proxy Error:', err);
          });
        },
      },
      '/servicos': {
        target: backendHost,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/servicos/, '/api/servicos'),
        secure: false,
      },
      '/usuarios': {
        target: backendHost,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/usuarios/, '/api/usuarios'),
        secure: false,
      },
    },
    
    watch: {
      usePolling: true,
      interval: 300,
    }, 
  },

  build: { 
    outDir: 'frontend/dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'axios'],
        },
      },
    },
  },
});

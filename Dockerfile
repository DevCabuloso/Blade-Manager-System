# --- Etapa 1: Build do frontend ---
FROM node:20 AS frontend-build
WORKDIR /app

# Copia package.json da raiz
COPY package*.json ./

# Instala dependências SEM executar postinstall (que tenta acessar /backend)
RUN npm install --ignore-scripts

# Copia o codigo do frontend
COPY frontend ./frontend
COPY index.html vite.config.js tailwind.config.js postcss.config.cjs ./

# Build do frontend
RUN npm run build

# --- Etapa 2: Backend + Frontend compilado ---
FROM node:20

WORKDIR /usr/src/blademanager

# Copia e instala o backend preservando a estrutura esperada pelo server.js
COPY backend/package*.json ./backend/
RUN cd backend && npm install
COPY backend ./backend

# Copia o build do frontend para a pasta esperada pelo backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["node", "backend/server.js"]

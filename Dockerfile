# --- Etapa 1: Build do frontend ---
FROM node:20 AS frontend-build
WORKDIR /app

# Copia package.json da raiz
COPY package*.json ./
RUN npm install

# Copia o codigo do frontend
COPY frontend ./frontend
COPY vite.config.js tailwind.config.js postcss.config.cjs ./

# Build do frontend
RUN npm run build

# --- Etapa 2: Backend + Frontend compilado ---
FROM node:20

WORKDIR /usr/src/blademanager

# Copia e instala o backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./

# Copia o build do frontend para dentro do backend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["node", "server.js"]

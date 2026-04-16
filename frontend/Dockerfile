FROM node:20-alpine AS frontend
WORKDIR /app
COPY package*.json ./
COPY vite.config.js ./
RUN npm install
COPY . .
RUN npm run build
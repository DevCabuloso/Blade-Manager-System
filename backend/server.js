
import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import horariosRoutes from './routes/horariosRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8000;
const isDev = process.env.NODE_ENV !== 'production';


app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));


const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
} else {
  const frontendRoot = path.join(__dirname, '..', 'frontend');
  const repoRoot = path.join(__dirname, '..');

  // Serve `frontend` folder if it exists and contains an index.html
  if (fs.existsSync(frontendRoot) && fs.existsSync(path.join(frontendRoot, 'index.html'))) {
    app.use(express.static(frontendRoot));
  // In production, allow serving an index.html from the repository root as a fallback
  } else if (!isDev && fs.existsSync(path.join(repoRoot, 'index.html'))) {
    app.use(express.static(repoRoot));
  // If frontend folder exists but doesn't contain index.html, still mount it so assets can be served
  } else if (fs.existsSync(frontendRoot)) {
    app.use(express.static(frontendRoot));
  }
}


app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src https://fonts.gstatic.com; " +
    "img-src 'self' data: http://localhost:8000; " +
    "connect-src 'self' http://localhost:8000;"
  );
  next();
});


app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.on('finish', () => console.log(`Resposta: ${res.statusCode}`));
  next();
});


app.use('/api/usuarios', userRoutes);
app.use('/api/servicos', serviceRoutes);
app.use('/api/agendamentos', appointmentRoutes);
app.use('/api/horarios', horariosRoutes);

// In development, proxy non-API requests to the Vite dev server so bare imports (like 'vue') resolve.
if (isDev) {
  app.use('*', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true,
    logLevel: 'silent'
  }));
}


app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, 'favicon.ico');
  if (fs.existsSync(faviconPath)) return res.sendFile(faviconPath);
  res.status(204).end();
});


app.use((req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  const indexFile = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);

  
  const indexDev = path.join(__dirname, '..', 'frontend', 'index.html');
  if (fs.existsSync(indexDev)) return res.sendFile(indexDev);

  // Also check for an index.html in the repository root.
  // Only serve the repo root index directly in production (dev is proxied to Vite).
  const repoIndex = path.join(__dirname, '..', 'index.html');
  if (!isDev && fs.existsSync(repoIndex)) return res.sendFile(repoIndex);

  
  return res.status(404).send('Página não encontrada');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno' });
});


// Start server with fallback if port is already in use
const HOST = '0.0.0.0';
const MAX_PORT_ATTEMPTS = 10;

const startServer = (startPort, attemptsLeft) => {
  const server = app.listen(startPort, HOST, () => {
    console.log(`Servidor rodando em http://localhost:${startPort}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      console.warn(`Porta ${startPort} em uso, tentando porta ${startPort + 1}...`);
      setTimeout(() => startServer(startPort + 1, attemptsLeft - 1), 200);
    } else {
      console.error('Erro ao iniciar o servidor:', err);
      process.exit(1);
    }
  });
};

startServer(Number(PORT) || 8000, MAX_PORT_ATTEMPTS);
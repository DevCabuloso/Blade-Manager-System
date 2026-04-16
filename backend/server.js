
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
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const normalizeOrigin = (origin) => {
  if (!origin) return null;
  return origin.replace(/\/$/, '').trim().replace(/^['\"]|['\"]$/g, '');
};

const originToHostname = (origin) => {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return null;
  try {
    return new URL(normalized).hostname;
  } catch {
    try {
      return new URL(`https://${normalized}`).hostname;
    } catch {
      return null;
    }
  }
};

const buildAllowedOrigins = () => {
  const envOrigins = (process.env.ORIGENS_PERMITIDAS || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);

  const baseOrigins = [
    normalizeOrigin(FRONTEND_URL),
    ...envOrigins,
    'http://localhost:5173',
    'http://localhost:8000'
  ];

  const expanded = baseOrigins.flatMap((origin) => {
    if (!origin || !origin.startsWith('http')) return [origin];
    try {
      const parsed = new URL(origin);
      const variants = [origin];
      if (parsed.hostname.startsWith('www.')) {
        variants.push(origin.replace('://www.', '://'));
      } else {
        variants.push(origin.replace('://', '://www.'));
      }
      return variants;
    } catch {
      return [origin];
    }
  });

  return [...new Set(expanded.map(normalizeOrigin).filter(Boolean))];
};

const allowedOrigins = buildAllowedOrigins();
const allowedHostnames = [...new Set(allowedOrigins.map(originToHostname).filter(Boolean))];


app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients without Origin header (health checks, curl, etc.).
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);
    const originHostname = originToHostname(origin);
    const isAllowedByOrigin = allowedOrigins.includes(normalizedOrigin);
    const isAllowedByHostname = originHostname && allowedHostnames.includes(originHostname);
    if (isAllowedByOrigin || isAllowedByHostname) {
      return callback(null, true);
    }
    return callback(new Error(`Origem não permitida por CORS: ${origin}`));
  },
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
  const cspPolicy = isDev 
    ? "default-src 'self' * ; script-src 'self' 'unsafe-inline' 'unsafe-eval' * ; style-src 'self' 'unsafe-inline' * ; font-src * ; img-src 'self' data: * ; connect-src 'self' * ;"
    : `default-src 'self' ${BACKEND_URL} ${FRONTEND_URL}; script-src 'self' 'unsafe-inline' 'unsafe-eval' ${FRONTEND_URL}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com ${FRONTEND_URL}; img-src 'self' data: ${BACKEND_URL}; connect-src 'self' ${BACKEND_URL};`;
  res.setHeader('Content-Security-Policy', cspPolicy);
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
    console.log(`Servidor rodando em ${BACKEND_URL}`);
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
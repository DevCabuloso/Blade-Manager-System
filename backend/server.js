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
import reportRoutes from './routes/reportRoutes.js';
import dotenv from 'dotenv';
import { createRateLimiter } from './middlewares/rateLimit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8000;
const isDev = process.env.NODE_ENV !== 'production';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const enableRequestLogs = process.env.LOG_HTTP_REQUESTS === 'true' || isDev;

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizeOrigin = (origin) => {
  if (!origin) return null;
  return origin.replace(/\/$/, '').trim().replace(/^['"]|['"]$/g, '');
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
    'http://localhost:8000',
  ];

  return [...new Set(baseOrigins.map(normalizeOrigin).filter(Boolean))];
};

const allowedOrigins = buildAllowedOrigins();

app.set('trust proxy', 1);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origem nao permitida por CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

const apiLimiter = createRateLimiter({
  windowMs: parsePositiveInt(process.env.API_RATE_LIMIT_WINDOW_MS, 60 * 1000),
  maxRequests: parsePositiveInt(process.env.API_RATE_LIMIT_MAX_REQUESTS, 120),
  message: 'Muitas requisicoes. Tente novamente em instantes.',
});

app.use('/api', apiLimiter);

const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
} else {
  const frontendRoot = path.join(__dirname, '..', 'frontend');
  const repoRoot = path.join(__dirname, '..');

  if (fs.existsSync(frontendRoot) && fs.existsSync(path.join(frontendRoot, 'index.html'))) {
    app.use(express.static(frontendRoot));
  } else if (!isDev && fs.existsSync(path.join(repoRoot, 'index.html'))) {
    app.use(express.static(repoRoot));
  } else if (fs.existsSync(frontendRoot)) {
    app.use(express.static(frontendRoot));
  }
}

app.use((req, res, next) => {
  const cspPolicy = isDev
    ? "default-src 'self' http: https: ws: data: blob: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https:; style-src 'self' 'unsafe-inline' http: https:; img-src 'self' data: blob: http: https:; connect-src 'self' ws: http: https:;"
    : [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'self'",
        `script-src 'self' 'unsafe-inline' ${FRONTEND_URL}`,
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com data:",
        `img-src 'self' data: blob: ${BACKEND_URL} ${FRONTEND_URL}`,
        `connect-src 'self' ${BACKEND_URL} ${FRONTEND_URL}`,
      ].join('; ');

  res.setHeader('Content-Security-Policy', cspPolicy);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!isDev) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

app.use((req, res, next) => {
  if (!enableRequestLogs) {
    return next();
  }

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.on('finish', () => console.log(`Resposta: ${res.statusCode}`));
  next();
});

app.use('/api/usuarios', userRoutes);
app.use('/api/servicos', serviceRoutes);
app.use('/api/agendamentos', appointmentRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/relatorios', reportRoutes);

if (isDev) {
  app.use('*', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true,
    logLevel: 'silent',
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

  const repoIndex = path.join(__dirname, '..', 'index.html');
  if (!isDev && fs.existsSync(repoIndex)) return res.sendFile(repoIndex);

  return res.status(404).send('Pagina nao encontrada');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erro interno' });
});

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

const store = new Map();
let requestCounter = 0;

const cleanupExpiredEntries = (now) => {
  for (const [key, entry] of store.entries()) {
    if (!entry || now >= entry.resetAt) {
      store.delete(key);
    }
  }
};

const getClientKey = (req) => {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();

  return forwardedFor || req.ip || 'unknown';
};

export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  maxRequests = 10,
  message = 'Muitas tentativas. Tente novamente mais tarde.',
} = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    requestCounter += 1;

    // Cleanup amortizado para evitar crescimento continuo do store em trafego longo.
    if (requestCounter % 200 === 0) {
      cleanupExpiredEntries(now);
    }

    const key = `${req.method}:${req.path}:${getClientKey(req)}`;
    const entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ message });
    }

    entry.count += 1;
    return next();
  };
};

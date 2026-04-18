import {
  clearAuthSession,
  clearLegacyPersistentAuth,
  clearPendingProfissionalId,
  clearRedirectAfterAuth,
  clearRedirectAfterRegister,
  getAuthToken,
  getPendingProfissionalId,
  getRedirectAfterAuth,
  getRedirectAfterRegister,
  setAuthSession,
} from '@/utils/authStorage.js';

const JWT_PARTS_LENGTH = 3;

export const normalizeRole = (value) => String(value || '').trim().toLowerCase();

const decodeBase64UrlJson = (value) => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const parseJwt = (token) => {
  if (typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== JWT_PARTS_LENGTH || parts.some((part) => !part)) {
    return null;
  }

  const [headerSegment, payloadSegment] = parts;
  const header = decodeBase64UrlJson(headerSegment);
  const payload = decodeBase64UrlJson(payloadSegment);

  if (!header || !payload) return null;
  if (normalizeRole(header.alg) === 'none') return null;

  return { header, payload };
};

export const getSessionAuthState = () => {
  const token = getAuthToken();

  if (!token) {
    clearLegacyPersistentAuth();
    return { token: null, tipoUsuario: null };
  }

  const parsedToken = parseJwt(token);
  const payload = parsedToken?.payload;
  const role = normalizeRole(payload?.tipo_usuario);
  const exp = Number(payload?.exp);
  const now = Math.floor(Date.now() / 1000);

  if (!parsedToken || !role || !Number.isFinite(exp) || exp <= now) {
    clearAuthSession();
    return { token: null, tipoUsuario: null };
  }

  clearLegacyPersistentAuth();
  return { token, tipoUsuario: role };
};

export const clearClientAuthState = (options = {}) => {
  clearAuthSession({
    clearRedirectAfterAuth: true,
    ...options,
  });
};

export const persistLoginSession = ({ token, user }) => {
  setAuthSession({ token, user });
  clearLegacyPersistentAuth();
};

export const resolveLoginRedirect = ({ userType, routeProfissionalId }) => {
  const normalizedUserType = normalizeRole(userType);
  const redirectAfterAuth = getRedirectAfterAuth();
  const redirectAfterRegister = getRedirectAfterRegister();
  const pendingProfissionalId = getPendingProfissionalId();

  if (normalizedUserType === 'admin') {
    clearRedirectAfterAuth();
    return redirectAfterAuth && redirectAfterAuth !== '/' ? redirectAfterAuth : '/adm/barbearias';
  }

  if (normalizedUserType === 'barbeiro') {
    clearRedirectAfterAuth();
    return redirectAfterAuth && redirectAfterAuth !== '/' ? redirectAfterAuth : '/dashboard';
  }

  if (normalizedUserType === 'cliente') {
    if (redirectAfterRegister) {
      clearRedirectAfterRegister();
      clearRedirectAfterAuth();

      if (redirectAfterRegister.startsWith('/agendar/')) {
        return redirectAfterRegister;
      }

      return `/agendar/${redirectAfterRegister}`;
    }

    const profissionalId = pendingProfissionalId || routeProfissionalId;
    clearPendingProfissionalId();
    clearRedirectAfterAuth();

    if (profissionalId) {
      return `/agendar/${profissionalId}`;
    }

    if (redirectAfterAuth && redirectAfterAuth.startsWith('/agendar/')) {
      return redirectAfterAuth;
    }

    return '/';
  }

  return '/';
};

import { getSessionAuthState } from '@/services/authService.js';
import { setPendingProfissionalId, setRedirectAfterAuth } from '@/utils/authStorage.js';

export const routeRequiresAuth = (route) =>
  route.matched.some((record) => record.meta?.requiresAuth);

const isSafeInternalPath = (path) =>
  typeof path === 'string' && path.startsWith('/') && !path.startsWith('//');

const normalizeProfissionalId = (value) => {
  if (Array.isArray(value)) return null;
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  return trimmed || null;
};

export const applyAuthGuard = (router) => {
  router.beforeEach((to) => {
    const { token } = getSessionAuthState();
    const profissionalId = normalizeProfissionalId(to.query.profissionalId);
    const requiresAuth = routeRequiresAuth(to);

    if (profissionalId && to.path === '/') {
      setPendingProfissionalId(profissionalId);
      return { path: `/agendar/${profissionalId}` };
    }

    if (profissionalId) {
      setPendingProfissionalId(profissionalId);
    }

    if (requiresAuth && !token) {
      if (isSafeInternalPath(to.fullPath) && to.path !== '/login') {
        setRedirectAfterAuth(to.fullPath);
      }

      return profissionalId
        ? { path: '/login', query: { profissionalId } }
        : { path: '/login' };
    }

    return true;
  });
};

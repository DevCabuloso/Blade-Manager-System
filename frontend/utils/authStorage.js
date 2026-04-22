const sessionKeys = {
  token: 'token',
  user: 'user',
  userId: 'userId',
  userRole: 'tipo_usuario',
  redirectAfterAuth: 'redirectAfterAuth',
  redirectAfterRegister: 'redirectAfterRegister',
  pendingProfissionalId: 'pendingProfissionalId',
  sidebarCollapsed: 'sidebarCollapsed',
};

const localKeys = {
  persistentAuth: 'blade_persistent_auth',
  loginCredentials: 'blade_login_credentials',
  loginPrefill: 'blade_login_prefill',
};

const safeJsonParse = (value, fallback = null) => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const removeSessionKeys = (keys) => {
  keys.forEach((key) => sessionStorage.removeItem(key));
};

const removeLocalKeys = (keys) => {
  keys.forEach((key) => localStorage.removeItem(key));
};

export const getAuthToken = () => sessionStorage.getItem(sessionKeys.token);

export const setAuthSession = ({ token, user }) => {
  sessionStorage.setItem(sessionKeys.token, token);
  sessionStorage.setItem(sessionKeys.user, JSON.stringify(user));
  sessionStorage.setItem(sessionKeys.userId, String(user.id));
};

export const clearAuthSession = ({
  clearRedirectAfterAuth = false,
  clearRedirectAfterRegister = false,
  clearPendingProfissionalId = false,
} = {}) => {
  const sessionKeysToRemove = [
    sessionKeys.token,
    sessionKeys.user,
    sessionKeys.userId,
    sessionKeys.userRole,
  ];

  if (clearRedirectAfterAuth) {
    sessionKeysToRemove.push(sessionKeys.redirectAfterAuth);
  }

  if (clearRedirectAfterRegister) {
    sessionKeysToRemove.push(sessionKeys.redirectAfterRegister);
  }

  if (clearPendingProfissionalId) {
    sessionKeysToRemove.push(sessionKeys.pendingProfissionalId);
  }

  removeSessionKeys(sessionKeysToRemove);
  removeLocalKeys([localKeys.persistentAuth]);
};

export const clearLegacyPersistentAuth = () => {
  removeSessionKeys([sessionKeys.userRole]);
  removeLocalKeys([localKeys.persistentAuth, localKeys.loginCredentials]);
};

export const getStoredUser = () => safeJsonParse(sessionStorage.getItem(sessionKeys.user));

export const setStoredUser = (user) => {
  sessionStorage.setItem(sessionKeys.user, JSON.stringify(user));
};

export const removeStoredUser = () => {
  sessionStorage.removeItem(sessionKeys.user);
};

export const getRedirectAfterAuth = () => sessionStorage.getItem(sessionKeys.redirectAfterAuth);
export const setRedirectAfterAuth = (path) => sessionStorage.setItem(sessionKeys.redirectAfterAuth, path);
export const clearRedirectAfterAuth = () => sessionStorage.removeItem(sessionKeys.redirectAfterAuth);

export const getRedirectAfterRegister = () => sessionStorage.getItem(sessionKeys.redirectAfterRegister);
export const setRedirectAfterRegister = (path) => sessionStorage.setItem(sessionKeys.redirectAfterRegister, path);
export const clearRedirectAfterRegister = () => sessionStorage.removeItem(sessionKeys.redirectAfterRegister);

export const getPendingProfissionalId = () => sessionStorage.getItem(sessionKeys.pendingProfissionalId);
export const setPendingProfissionalId = (id) => sessionStorage.setItem(sessionKeys.pendingProfissionalId, id);
export const clearPendingProfissionalId = () => sessionStorage.removeItem(sessionKeys.pendingProfissionalId);

export const getRememberedLoginPrefill = () =>
  safeJsonParse(localStorage.getItem(localKeys.loginPrefill), { email: '' });

export const setRememberedLoginPrefill = (email) => {
  localStorage.setItem(localKeys.loginPrefill, JSON.stringify({ email }));
};

export const clearRememberedLoginPrefill = () => {
  localStorage.removeItem(localKeys.loginPrefill);
};

export const getSidebarCollapsed = () => sessionStorage.getItem(sessionKeys.sidebarCollapsed);
export const setSidebarCollapsed = (value) =>
  sessionStorage.setItem(sessionKeys.sidebarCollapsed, String(value));

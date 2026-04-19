import { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_STORAGE_KEY, MOCK_AUTH_STORAGE_KEY } from '../../common/Constant';

export type AuthUserProfile = {
  name: string;
  email: string;
  /** Role Spatie, mis. `ADMIN`, `MARIFATUN_USER` — dipakai untuk menyembunyikan aksi admin di UI. */
  roles: string[];
};

/** Demo-only: mark user as logged in for mock flows. */
export const setMockAuthenticated = (value = true) => {
  try {
    localStorage.setItem(MOCK_AUTH_STORAGE_KEY, value ? '1' : '0');
  } catch {
    /* ignore */
  }
};

export const clearMockAuthenticated = () => {
  try {
    localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

export const isMockAuthenticated = (): boolean => {
  try {
    return localStorage.getItem(MOCK_AUTH_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const setAuthToken = (token: string) => {
  try {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    /* ignore */
  }
};

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

export const setAuthUserProfile = (profile: AuthUserProfile) => {
  try {
    const name = profile.name.trim();
    const email = profile.email.trim();
    const roles = Array.isArray(profile.roles) ? profile.roles.map(String) : [];
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify({ name, email, roles }));
  } catch {
    /* ignore */
  }
};

export const getAuthUserProfile = (): AuthUserProfile | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { name?: unknown; email?: unknown; roles?: unknown };
    const name = typeof parsed.name === 'string' ? parsed.name : '';
    const email = typeof parsed.email === 'string' ? parsed.email : '';
    const roles = Array.isArray(parsed.roles)
      ? parsed.roles.filter((r): r is string => typeof r === 'string')
      : [];
    if (!name && !email) return null;
    return { name, email, roles };
  } catch {
    return null;
  }
};

export const clearAuthUserProfile = () => {
  try {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

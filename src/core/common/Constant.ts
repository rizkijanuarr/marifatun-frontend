export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
export const APP_NAME = 'Marifatun';
export const DEFAULT_LANG = 'id';
export const LANG_STORAGE_KEY = 'marifatun.lang';

export const MOCK_AUTH_STORAGE_KEY = 'marifatun.mockAuth';

/** Sanctum / Bearer token from login or register. */
export const AUTH_TOKEN_STORAGE_KEY = 'marifatun.authToken';

/** JSON `{ name, email }` setelah login/register (selaras dengan `AuthSessionData.user`). */
export const AUTH_USER_STORAGE_KEY = 'marifatun.authUser';

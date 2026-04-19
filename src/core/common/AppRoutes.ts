/** REST API path segments (base URL + prefix di-setup di HttpClient). */
export const AppRoutes = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    LOGOUT: '/api/v1/auth/logout',
  },
  USERS: {
    GET_ALL: '/api/v1/users',
    BY_ID: (userId: string) => `/api/v1/users/${encodeURIComponent(userId)}`,
  },
  DASHBOARD: {
    /** Ringkasan admin (role ADMIN). */
    ADMIN: '/api/v1/dashboard/admin',
    /** Ringkasan user (role MARIFATUN_USER). */
    USER: '/api/v1/dashboard/user',
  },
  /** Konten khusus admin — semua user. */
  CONTENTS_ADMIN: {
    LIST: '/api/v1/contents',
    BY_ID: (id: string) => `/api/v1/contents/${encodeURIComponent(id)}`,
  },
  /** Konten milik user login — `MARIFATUN_USER`. */
  CONTENTS_USER: {
    LIST: '/api/v1/user/contents',
    BY_ID: (id: string) => `/api/v1/user/contents/${encodeURIComponent(id)}`,
    /** Agregat untuk chart (role MARIFATUN_USER). */
    STATISTICS: '/api/v1/user/contents/statistics',
  },
} as const;

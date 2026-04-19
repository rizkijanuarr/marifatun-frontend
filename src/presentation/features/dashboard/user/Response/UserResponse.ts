import type { UserListPaginationMeta, UserRole } from '../Model/UserModel';

/** Payload user dari API (list / detail). `active` bisa boolean atau 0/1 dari BE. */
export type UserApiDto = {
  id: string;
  name: string;
  email: string;
  active: boolean | 0 | 1;
  roles: string[];
  createdDate: string;
  modifiedDate: string;
};

/** Statistik agregat di `meta.statistics` (kunci domain dinamis seperti `total_@gmail.com` dibaca lewat cast di mapper). */
export type UserListStatisticsApi = {
  total_count_user_30_hari_terakhir?: number;
  total_active_user?: number;
  total_not_active_user?: number;
  total_role?: Record<string, number>;
};

/** Response GET /api/v1/users (sukses). */
export type UserListApiEnvelope = {
  status: number;
  success: true;
  message: string;
  data: UserApiDto[];
  meta: {
    /** Jumlah seluruh baris di tabel users (tanpa memandang filter halaman). */
    total_users: number;
    pagination: UserListPaginationMeta;
    statistics?: UserListStatisticsApi;
  };
};

export type UserListQuery = {
  page: number;
  per_page: number;
  search?: string;
  /** Jika di-set, filter user aktif / tidak aktif. */
  active?: boolean;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
};

export type UpdateUserPayload = {
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  /** Hanya dikirim jika user mengisi password baru. */
  password?: string;
};

export type UserDetailApiEnvelope = {
  status: number;
  success: true;
  message: string;
  data: UserApiDto;
};

export type UserMutationApiEnvelope = {
  status: number;
  success: true;
  message: string;
  data: UserApiDto;
};

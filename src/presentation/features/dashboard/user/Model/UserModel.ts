export type UserChartPreset =
  | 'user-growth'
  | 'revenue-monthly'
  | 'plan-doughnut'
  | 'category-radar'
  | 'user-signups'
  | 'user-status'
  | 'user-plan'
  | 'user-retention';

export type UserChartDef = {
  titleKey: string;
  subtitleKey: string;
  preset: UserChartPreset;
  labels?: string[];
  values?: number[];
  badgeLiteral?: string;
  badgeKey?: string;
  badgeVariant?: 'success' | 'primary' | 'muted';
};

export type UserStatIconId = 'total' | 'premium' | 'newMonth' | 'inactive' | 'mail';

export type UserStatDef = {
  /** Key stabil untuk list React */
  id: string;
  titleKey: string;
  /** Ganti `{name}` di string hasil `t(titleKey)` */
  titleParams?: Record<string, string>;
  value: string;
  badgeKey: string;
  badgeClass: string;
  icon: UserStatIconId;
};

/** Role assignment dari API (create/update). */
export type UserRole = 'ADMIN' | 'MARIFATUN_USER';

export type UserRowModel = {
  id: string;
  initials: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  planBadgeClass: string;
  statusKey: string;
  statusBadgeClass: string;
  joined: string;
  /** Untuk form edit — dari API `roles`. */
  primaryRole?: UserRole;
  /** Dari API `active`. */
  active?: boolean;
};

/** Meta pagination dari GET /api/v1/users */
export type UserListPaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
};

export type UserDashboardModel = {
  stats: UserStatDef[];
  chartsPrimary: UserChartDef[];
  chartsSecondary: UserChartDef[];
  rows: UserRowModel[];
  pagination: UserListPaginationMeta | null;
  /** Dari `meta.total_users` — total user di DB (bukan filter). */
  totalUsersInDb: number | null;
};

export type DashboardChartPreset =
  | 'user-growth'
  | 'revenue-monthly'
  | 'plan-doughnut'
  | 'category-radar'
  | 'user-status';

export type DashboardChartDef = {
  titleKey: string;
  subtitleKey: string;
  preset: DashboardChartPreset;
  labels?: string[];
  values?: number[];
  /** Jika di-set, label chart diambil dari `t(key)` per elemen (untuk bar/doughnut dinamis). */
  labelKeys?: string[];
  badgeLiteral?: string;
  badgeKey?: string;
  badgeVariant?: 'success' | 'primary' | 'muted';
};

export type DashboardStatIconId = 'users' | 'document';

export type DashboardStatDef = {
  titleKey: string;
  value: string;
  icon: DashboardStatIconId;
  /** Optional progress bar percentage (0–100) */
  progressPct?: number;
  /** Quota label shown next to progress bar meta */
  quota?: string;
  badgeLiteral?: string;
  badgeClass?: string;
  metaKey?: string;
  /** Untuk `metaKey` dengan placeholder `{name}` */
  metaParams?: Record<string, string | number>;
};

export type DashboardBanner = {
  userName: string;
  role: string;
};

export type DashboardModel = {
  banner: DashboardBanner;
  stats: DashboardStatDef[];
  charts: DashboardChartDef[];
};

import type { DashboardModel } from './DashboardModel';

/** Contoh data statis (tidak dipakai runtime; referensi layout). */
export const mockDashboard: DashboardModel = {
  banner: {
    userName: 'Rizki Januar',
    role: 'ADMIN',
  },

  stats: [],

  charts: [
    {
      titleKey: 'back-desk.feature-dashboard.chart_content_by_type_title',
      subtitleKey: 'back-desk.feature-dashboard.chart_content_by_type_subtitle',
      preset: 'plan-doughnut',
      labels: ['LinkedIn', 'X', 'Threads'],
      values: [120, 80, 45],
      badgeLiteral: '245',
      badgeVariant: 'primary',
    },
  ],
};

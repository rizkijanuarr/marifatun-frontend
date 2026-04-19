import type { ReactNode } from 'react';

const stroke = {
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const statIcons = {
  users: (
    <svg {...stroke}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  document: (
    <svg {...stroke}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
} as const;

export type StatIconKey = keyof typeof statIcons;

/** User management stat cards (feature-user) */
export const userStatIcons = {
  total: (
    <svg {...stroke}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  ),
  premium: (
    <svg {...stroke}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  newMonth: (
    <svg {...stroke}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  inactive: (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  mail: (
    <svg {...stroke}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
} as const;

export type UserStatIconKey = keyof typeof userStatIcons;

export const overviewChartIcons: Record<string, ReactNode> = {
  'user-growth': (
    <svg {...stroke}>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  ),
  'revenue-monthly': (
    <svg {...stroke}>
      <rect x="3" y="12" width="4" height="8" />
      <rect x="10" y="8" width="4" height="12" />
      <rect x="17" y="4" width="4" height="16" />
    </svg>
  ),
  'plan-doughnut': (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9l6.36 6.36" />
    </svg>
  ),
  'category-radar': (
    <svg {...stroke}>
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <polygon points="12 6 18 9.5 18 14.5 12 18 6 14.5 6 9.5 12 6" />
    </svg>
  ),
  'user-signups': (
    <svg {...stroke}>
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="14 7 21 7 21 14" />
    </svg>
  ),
  'user-status': (
    <svg {...stroke}>
      <path d="M20 7h-9" />
      <path d="M14 17H5" />
      <circle cx="17" cy="17" r="3" />
      <circle cx="7" cy="7" r="3" />
    </svg>
  ),
  'user-plan': (
    <svg {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9l7 4" />
    </svg>
  ),
  'user-retention': (
    <svg {...stroke}>
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 4 4 5-7" />
    </svg>
  ),
};

export const TableIconView = (
  <svg {...stroke}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const TableIconEdit = (
  <svg {...stroke}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const TableIconDelete = (
  <svg {...stroke}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

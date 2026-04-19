import { profileHasAdminRole } from '../../../../../core/common/authRoles';
import { AppRoutes } from '../../../../../core/common/AppRoutes';
import { getAuthUserProfile } from '../../../../../core/config/GlobalStorage/GlobalStorage';
import type { ApiSuccessEnvelope } from '../../../../../core/network/apiTypes';
import { httpClient } from '../../../../../core/network/HttpClient';
import { parseApiError } from '../../../../../core/network/parseApiError';
import type { DashboardModel } from '../Model/DashboardModel';
import type { DashboardRepository } from '../Repository/DashboardRepository';
import type { AdminDashboardData, UserDashboardData } from '../Response/DashboardResponse';
import { TONE_VALUES } from '../../content/Model/ContentModel';

const NETWORK_FALLBACK = 'Gagal memuat dashboard.';

const fmtInt = (n: number) => new Intl.NumberFormat('id-ID').format(Math.max(0, Math.floor(n)));

/** Selaras `App\Enums\ContentTypeEnum::value` → label singkat. */
const CONTENT_TYPE_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  x: 'X',
  thread: 'Threads',
  facebook: 'Facebook',
  email_marketing: 'Email Marketing',
  video_script: 'Skrip video',
};

function labelContentType(key: string): string {
  return CONTENT_TYPE_LABELS[key] ?? key;
}

function toneChartLabelKeys(rows: Array<{ tone: string; total: number }>): { labelKeys: string[] } | { labels: string[] } {
  if (rows.length === 0) {
    return { labels: ['—'] };
  }
  const useI18nKeys = rows.every(
    (r) => r.tone === 'unknown' || (TONE_VALUES as readonly string[]).includes(r.tone),
  );
  if (useI18nKeys) {
    return {
      labelKeys: rows.map((r) =>
        r.tone === 'unknown'
          ? 'back-desk.feature-dashboard.chart_tone_unknown'
          : `back-desk.feature-content.enum.tone.${r.tone}`,
      ),
    };
  }
  return { labels: rows.map((r) => r.tone) };
}

function mapAdminSummary(d: AdminDashboardData): DashboardModel {
  const entries = Object.entries(d.contents_by_type ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
  const cLabels = entries.length > 0 ? entries.map(([k]) => labelContentType(k)) : ['—'];
  const cValues = entries.length > 0 ? entries.map(([, v]) => Number(v) || 0) : [0];

  const usersByRole = d.users_by_role ?? [];
  const roleLabelKeys = usersByRole.map((r) =>
    r.role === 'ADMIN'
      ? 'back-desk.feature-dashboard.chart_role_admin'
      : 'back-desk.feature-dashboard.chart_role_marifatun_user',
  );
  const roleValues = usersByRole.length > 0 ? usersByRole.map((r) => Number(r.total) || 0) : [0];

  const status = d.content_status_breakdown ?? { active: 0, inactive: 0 };
  const statusLabelKeys = [
    'back-desk.feature-dashboard.chart_content_status_active',
    'back-desk.feature-dashboard.chart_content_status_inactive',
  ];
  const statusValues = [Number(status.active) || 0, Number(status.inactive) || 0];

  const toneRows = d.contents_by_tone ?? [];
  const toneValues = toneRows.length > 0 ? toneRows.map((r) => Number(r.total) || 0) : [0];
  const toneLbl =
    toneRows.length === 0 ? { labels: ['—'] as string[] } : toneChartLabelKeys(toneRows);
  const toneChartProps =
    'labelKeys' in toneLbl ? { labelKeys: toneLbl.labelKeys } : { labels: toneLbl.labels };

  const monthRows = d.contents_created_by_month ?? [];
  const monthLabels = monthRows.length > 0 ? monthRows.map((r) => r.label) : ['—'];
  const monthValues = monthRows.length > 0 ? monthRows.map((r) => Number(r.total) || 0) : [0];

  return {
    banner: { userName: '', role: 'ADMIN' },
    stats: [],
    charts: [
      {
        titleKey: 'back-desk.feature-dashboard.chart_content_by_type_title',
        subtitleKey: 'back-desk.feature-dashboard.chart_content_by_type_subtitle',
        preset: 'plan-doughnut',
        labels: cLabels,
        values: cValues,
        badgeLiteral: fmtInt(d.total_contents),
        badgeVariant: 'primary',
      },
      {
        titleKey: 'back-desk.feature-dashboard.chart_users_by_role_title',
        subtitleKey: 'back-desk.feature-dashboard.chart_users_by_role_subtitle',
        preset: 'user-status',
        labelKeys: usersByRole.length > 0 ? roleLabelKeys : undefined,
        labels: usersByRole.length > 0 ? undefined : ['—'],
        values: roleValues,
        badgeLiteral: fmtInt(d.total_users),
        badgeVariant: 'muted',
      },
      {
        titleKey: 'back-desk.feature-dashboard.chart_content_status_title',
        subtitleKey: 'back-desk.feature-dashboard.chart_content_status_subtitle',
        preset: 'revenue-monthly',
        labelKeys: statusLabelKeys,
        values: statusValues,
        badgeLiteral: fmtInt(d.total_contents),
        badgeVariant: 'primary',
      },
      {
        titleKey: 'back-desk.feature-dashboard.chart_content_tone_title',
        subtitleKey: 'back-desk.feature-dashboard.chart_content_tone_subtitle',
        preset: 'plan-doughnut',
        ...toneChartProps,
        values: toneValues,
        badgeLiteral: fmtInt(d.total_contents),
        badgeVariant: 'muted',
      },
      {
        titleKey: 'back-desk.feature-dashboard.chart_content_timeline_title',
        subtitleKey: 'back-desk.feature-dashboard.chart_content_timeline_subtitle',
        preset: 'user-growth',
        labels: monthLabels,
        values: monthValues,
        badgeLiteral: fmtInt(d.total_contents),
        badgeVariant: 'primary',
      },
    ],
  };
}

function mapUserSummary(d: UserDashboardData): DashboardModel {
  const entries = Object.entries(d.contents_by_type ?? {}).sort((a, b) => a[0].localeCompare(b[0]));
  const cLabels = entries.length > 0 ? entries.map(([k]) => labelContentType(k)) : ['—'];
  const cValues = entries.length > 0 ? entries.map(([, v]) => Number(v) || 0) : [0];

  return {
    banner: { userName: '', role: 'MARIFATUN_USER' },
    stats: [],
    charts: [
      {
        titleKey: 'back-desk.feature-dashboard.chart_content_by_type_title',
        subtitleKey: 'back-desk.feature-dashboard.chart_content_by_type_subtitle',
        preset: 'plan-doughnut',
        labels: cLabels,
        values: cValues,
        badgeLiteral: fmtInt(d.total_contents),
        badgeVariant: 'primary',
      },
    ],
  };
}

export class DashboardService implements DashboardRepository {
  async getDashboard(): Promise<DashboardModel> {
    try {
      const isAdmin = profileHasAdminRole(getAuthUserProfile()?.roles);
      if (isAdmin) {
        const { data } = await httpClient.get<ApiSuccessEnvelope<AdminDashboardData>>(AppRoutes.DASHBOARD.ADMIN);
        if (!data.success || data.data == null) {
          throw new Error(data.message ?? NETWORK_FALLBACK);
        }
        return mapAdminSummary(data.data);
      }

      const { data } = await httpClient.get<ApiSuccessEnvelope<UserDashboardData>>(AppRoutes.DASHBOARD.USER);
      if (!data.success || data.data == null) {
        throw new Error(data.message ?? NETWORK_FALLBACK);
      }
      return mapUserSummary(data.data);
    } catch (e) {
      throw new Error(parseApiError(e, NETWORK_FALLBACK));
    }
  }
}

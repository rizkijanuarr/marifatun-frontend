import { AppRoutes } from '../../../../../core/common/AppRoutes';
import type { UserDashboardModel, UserRole, UserRowModel, UserStatDef } from '../Model/UserModel';
import type { UserRepository } from '../Repository/UserRepository';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserApiDto,
  UserDetailApiEnvelope,
  UserListApiEnvelope,
  UserListQuery,
  UserMutationApiEnvelope,
} from '../Response/UserResponse';
import { httpClient } from '../../../../../core/network/HttpClient';
import { parseApiError } from '../../../../../core/network/parseApiError';

const NETWORK_FALLBACK = 'Gagal memuat data user.';
const MUTATION_FALLBACK = 'Permintaan gagal.';

const pickPrimaryRole = (roles: string[]): UserRole =>
  roles.includes('ADMIN') ? 'ADMIN' : 'MARIFATUN_USER';

const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  return name.slice(0, 2).toUpperCase() || '—';
};

const formatJoined = (iso: string): string => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

/** Normalisasi `active` dari API (boolean atau 0/1). */
const isUserActiveFromApi = (active: UserApiDto['active']): boolean => {
  if (typeof active === 'boolean') return active;
  return active === 1;
};

const I18N_USER_STAT = 'back-desk.feature-user';

const numStat = (v: unknown): number => {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.floor(v));
  return 0;
};

const formatStatInt = (n: number): string => new Intl.NumberFormat('id-ID').format(n);

/** Map `meta.statistics` + `meta.total_users` → kartu StatisticCard. */
function mapStatisticsToUserStats(meta: UserListApiEnvelope['meta']): UserStatDef[] {
  if (!meta.statistics || typeof meta.statistics !== 'object') return [];

  const stats = meta.statistics;
  const extra = stats as Record<string, unknown>;
  const out: UserStatDef[] = [];

  out.push({
    id: 'meta-total-users',
    titleKey: `${I18N_USER_STAT}.stat_total_users_title`,
    value: formatStatInt(numStat(meta.total_users)),
    badgeKey: `${I18N_USER_STAT}.stat_total_users_badge`,
    badgeClass: 'badge--primary',
    icon: 'total',
  });

  out.push({
    id: 'stat-last-30d',
    titleKey: `${I18N_USER_STAT}.stat_last_30d_title`,
    value: formatStatInt(numStat(stats.total_count_user_30_hari_terakhir)),
    badgeKey: `${I18N_USER_STAT}.stat_last_30d_badge`,
    badgeClass: 'badge--muted',
    icon: 'newMonth',
  });

  out.push({
    id: 'stat-active',
    titleKey: `${I18N_USER_STAT}.stat_active_title`,
    value: formatStatInt(numStat(stats.total_active_user)),
    badgeKey: `${I18N_USER_STAT}.stat_active_badge`,
    badgeClass: 'badge--success',
    icon: 'premium',
  });

  out.push({
    id: 'stat-inactive',
    titleKey: `${I18N_USER_STAT}.stat_inactive_title`,
    value: formatStatInt(numStat(stats.total_not_active_user)),
    badgeKey: `${I18N_USER_STAT}.stat_inactive_badge`,
    badgeClass: 'badge--muted',
    icon: 'inactive',
  });

  const roles = stats.total_role;
  if (roles && typeof roles === 'object' && !Array.isArray(roles)) {
    const entries = Object.entries(roles);
    const weight = (r: string) => (r === 'ADMIN' ? 0 : r === 'MARIFATUN_USER' ? 1 : 2);
    entries.sort((a, b) => {
      const wa = weight(a[0]);
      const wb = weight(b[0]);
      if (wa !== wb) return wa - wb;
      return a[0].localeCompare(b[0]);
    });
    entries.forEach(([role, n], i) => {
      out.push({
        id: `stat-role-${role}`,
        titleKey: `${I18N_USER_STAT}.stat_role_title`,
        titleParams: { role },
        value: formatStatInt(numStat(n)),
        badgeKey: `${I18N_USER_STAT}.stat_role_badge`,
        badgeClass: 'badge--muted',
        icon: i % 2 === 0 ? 'premium' : 'total',
      });
    });
  }

  const domainKeys = Object.keys(extra).filter(
    (k) => k.startsWith('total_@') && typeof extra[k] === 'number' && Number.isFinite(extra[k] as number),
  );
  domainKeys.sort((a, b) => a.localeCompare(b));
  for (const key of domainKeys) {
    const domain = key.slice('total_'.length);
    out.push({
      id: `stat-domain-${key.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
      titleKey: `${I18N_USER_STAT}.stat_email_domain_title`,
      titleParams: { domain },
      value: formatStatInt(numStat(extra[key])),
      badgeKey: `${I18N_USER_STAT}.stat_email_domain_badge`,
      badgeClass: 'badge--muted',
      icon: 'mail',
    });
  }

  return out;
}

const mapDtoToRow = (dto: UserApiDto): UserRowModel => {
  const rolesLabel = dto.roles?.length ? dto.roles.join(', ') : '—';
  const activeOn = isUserActiveFromApi(dto.active);
  return {
    id: dto.id,
    initials: initialsFromName(dto.name),
    name: dto.name,
    email: dto.email,
    phone: '—',
    plan: rolesLabel,
    planBadgeClass: 'badge badge--muted',
    statusKey: activeOn
      ? 'back-desk.feature-user.table.row_status_active'
      : 'back-desk.feature-user.table.row_status_inactive',
    statusBadgeClass: activeOn ? 'badge badge--success' : 'badge badge--muted',
    joined: formatJoined(dto.createdDate),
    primaryRole: pickPrimaryRole(dto.roles ?? []),
    active: activeOn,
  };
};

export class UserService implements UserRepository {
  async getUsersDashboard(query: UserListQuery): Promise<UserDashboardModel> {
    try {
      const params: Record<string, string | number> = {
        page: query.page,
        per_page: query.per_page,
      };
      if (query.search?.trim()) params.search = query.search.trim();
      if (query.active !== undefined) params.active = query.active ? '1' : '0';

      const { data } = await httpClient.get<UserListApiEnvelope>(AppRoutes.USERS.GET_ALL, { params });

      if (!data.success || !Array.isArray(data.data)) {
        throw new Error((data as unknown as { message?: string }).message ?? 'Response tidak valid.');
      }

      const rows = data.data.map(mapDtoToRow);

      return {
        stats: mapStatisticsToUserStats(data.meta),
        chartsPrimary: [],
        chartsSecondary: [],
        rows,
        pagination: data.meta.pagination,
        totalUsersInDb: typeof data.meta.total_users === 'number' ? data.meta.total_users : null,
      };
    } catch (e) {
      throw new Error(parseApiError(e, NETWORK_FALLBACK));
    }
  }

  /** GET list minimal (page=1, per_page=1) untuk `meta.total_users` — badge sidebar (null-safe → 0). */
  async fetchTotalUsersInDb(): Promise<number> {
    try {
      const { data } = await httpClient.get<UserListApiEnvelope>(AppRoutes.USERS.GET_ALL, {
        params: { page: 1, per_page: 1 },
      });
      if (!data.success) return 0;
      const raw = data.meta?.total_users;
      if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
      return 0;
    } catch {
      return 0;
    }
  }

  async getUser(id: string): Promise<UserApiDto> {
    try {
      const { data } = await httpClient.get<UserDetailApiEnvelope>(AppRoutes.USERS.BY_ID(id));
      if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Response tidak valid.');
      }
      return data.data;
    } catch (e) {
      throw new Error(parseApiError(e, NETWORK_FALLBACK));
    }
  }

  async createUser(payload: CreateUserPayload): Promise<UserApiDto> {
    try {
      const { data } = await httpClient.post<UserMutationApiEnvelope>(AppRoutes.USERS.GET_ALL, payload);
      if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Gagal membuat user.');
      }
      return data.data;
    } catch (e) {
      throw new Error(parseApiError(e, MUTATION_FALLBACK));
    }
  }

  async updateUser(id: string, payload: UpdateUserPayload): Promise<UserApiDto> {
    try {
      const body: Record<string, unknown> = {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        active: payload.active,
      };
      if (payload.password?.trim()) body.password = payload.password.trim();

      const { data } = await httpClient.put<UserMutationApiEnvelope>(AppRoutes.USERS.BY_ID(id), body);
      if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Gagal memperbarui user.');
      }
      return data.data;
    } catch (e) {
      throw new Error(parseApiError(e, MUTATION_FALLBACK));
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await httpClient.delete(AppRoutes.USERS.BY_ID(id));
    } catch (e) {
      throw new Error(parseApiError(e, MUTATION_FALLBACK));
    }
  }
}

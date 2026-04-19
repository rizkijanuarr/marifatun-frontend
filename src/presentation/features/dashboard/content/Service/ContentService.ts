import { profileHasAdminRole } from '../../../../../core/common/authRoles';
import { AppRoutes } from '../../../../../core/common/AppRoutes';
import { getAuthUserProfile } from '../../../../../core/config/GlobalStorage/GlobalStorage';
import type { ContentDashboardModel, ContentListQuery, ContentRowModel } from '../Model/ContentModel';
import type { ContentRepository } from '../Repository/ContentRepository';
import type {
  ContentApiDto,
  ContentListApiEnvelope,
  ContentMutationApiEnvelope,
  CreateContentPayload,
  UpdateContentPayload,
  UserContentChartStatistics,
  UserContentStatisticsEnvelope,
} from '../Response/ContentResponse';
import { httpClient } from '../../../../../core/network/HttpClient';
import { parseApiError } from '../../../../../core/network/parseApiError';

const NETWORK_FALLBACK = 'Gagal memuat data konten.';
const MUTATION_FALLBACK = 'Permintaan gagal.';

const LONG_REQUEST_MS = 120_000;

function contentRoutes(isAdmin: boolean) {
  return isAdmin ? AppRoutes.CONTENTS_ADMIN : AppRoutes.CONTENTS_USER;
}

/** Untuk mutasi/detail: ikut role user saat ini. */
function contentRoutesForSession(): ReturnType<typeof contentRoutes> {
  return contentRoutes(profileHasAdminRole(getAuthUserProfile()?.roles));
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  x: 'X',
  thread: 'Threads',
  facebook: 'Facebook',
  email_marketing: 'Email',
  video_script: 'Video script',
};

function labelContentType(key: string): string {
  return CONTENT_TYPE_LABELS[key] ?? key;
}

const formatIsoDate = (iso: string | null): string => {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const truncate = (s: string, max: number): string => {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
};

const mapDtoToRow = (dto: ContentApiDto): ContentRowModel => {
  const topic = dto.topic ?? '';
  const ownerName = dto.user?.name?.trim() || '—';
  const ownerEmail = dto.user?.email?.trim() || '—';
  const kwRaw = (dto.keywords ?? '').trim();

  return {
    id: dto.id,
    topic,
    topicShort: truncate(topic, 72),
    content_type: dto.content_type,
    contentTypeLabel: labelContentType(dto.content_type),
    tone: dto.tone ?? '',
    keywordsShort: kwRaw ? truncate(kwRaw, 56) : '',
    keywordsFull: kwRaw,
    ownerName,
    ownerEmail,
    active: Boolean(dto.active),
    createdLabel: formatIsoDate(dto.createdDate),
  };
};

/** Untuk row tabel / modal setelah create — sama dengan mapping list. */
export function mapContentApiDtoToRowModel(dto: ContentApiDto): ContentRowModel {
  return mapDtoToRow(dto);
}

function buildListParams(query: ContentListQuery, isAdmin: boolean): Record<string, string | number> {
  const perPage = query.per_page > 0 ? query.per_page : 15;

  const params: Record<string, string | number> = {
    page: query.page,
    per_page: perPage,
  };

  if (query.search?.trim()) params.search = query.search.trim();

  if (isAdmin) {
    if (query.content_type) params.content_type = query.content_type;
    if (query.active === true) params.active = 1;
    if (query.active === false) params.active = 0;
  }

  if (query.date_from) params.date_from = query.date_from;
  if (query.date_to) params.date_to = query.date_to;
  if (query.sort_direction) params.sort_direction = query.sort_direction;

  return params;
}

export class ContentService implements ContentRepository {
  async listContents(isAdmin: boolean, query: ContentListQuery): Promise<ContentDashboardModel> {
    try {
      const params = buildListParams(query, isAdmin);
      const { data } = await httpClient.get<ContentListApiEnvelope>(contentRoutes(isAdmin).LIST, { params });

      if (!data.success || !Array.isArray(data.data)) {
        throw new Error((data as unknown as { message?: string }).message ?? 'Response tidak valid.');
      }

      const rows = data.data.map(mapDtoToRow);
      const pagination = data.meta?.pagination ?? null;
      const statistics = isAdmin && data.meta?.statistics ? data.meta.statistics : null;

      return {
        rows,
        pagination,
        statistics,
      };
    } catch (e) {
      throw new Error(parseApiError(e, NETWORK_FALLBACK));
    }
  }

  /** GET list minimal (page=1, per_page=1) untuk `meta.pagination.total` — badge sidebar (null-safe → 0). */
  async fetchTotalContentsInDb(): Promise<number> {
    try {
      const isAdmin = profileHasAdminRole(getAuthUserProfile()?.roles);
      const params = buildListParams({ page: 1, per_page: 1 }, isAdmin);
      const { data } = await httpClient.get<ContentListApiEnvelope>(contentRoutes(isAdmin).LIST, { params });
      if (!data.success) return 0;
      const raw = data.meta?.pagination?.total;
      if (typeof raw === 'number' && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
      return 0;
    } catch {
      return 0;
    }
  }

  async getContent(id: string): Promise<ContentApiDto> {
    try {
      const { data } = await httpClient.get<{ status: number; success: boolean; message: string; data: ContentApiDto }>(
        contentRoutesForSession().BY_ID(id),
      );
      if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Response tidak valid.');
      }
      return data.data;
    } catch (e) {
      throw new Error(parseApiError(e, NETWORK_FALLBACK));
    }
  }

  async createContent(payload: CreateContentPayload): Promise<ContentApiDto> {
    try {
      const { data } = await httpClient.post<ContentMutationApiEnvelope>(contentRoutesForSession().LIST, payload, {
        timeout: LONG_REQUEST_MS,
      });
      if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Gagal membuat konten.');
      }
      return data.data;
    } catch (e) {
      throw new Error(parseApiError(e, MUTATION_FALLBACK));
    }
  }

  async updateContent(id: string, payload: UpdateContentPayload): Promise<ContentApiDto> {
    try {
      const { data } = await httpClient.put<ContentMutationApiEnvelope>(contentRoutesForSession().BY_ID(id), payload, {
        timeout: LONG_REQUEST_MS,
      });
      if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Gagal memperbarui konten.');
      }
      return data.data;
    } catch (e) {
      throw new Error(parseApiError(e, MUTATION_FALLBACK));
    }
  }

  async deleteContent(id: string): Promise<void> {
    try {
      await httpClient.delete(contentRoutesForSession().BY_ID(id));
    } catch (e) {
      throw new Error(parseApiError(e, MUTATION_FALLBACK));
    }
  }

  /**
   * Statistik agregat untuk chart (hanya role MARIFATUN_USER — `GET /api/v1/user/contents/statistics`).
   */
  async fetchUserContentStatistics(): Promise<UserContentChartStatistics> {
    try {
      const { data } = await httpClient.get<UserContentStatisticsEnvelope>(AppRoutes.CONTENTS_USER.STATISTICS);
      if (!data.success || !data.data) {
        throw new Error(data.message ?? 'Response tidak valid.');
      }
      return data.data;
    } catch (e) {
      throw new Error(parseApiError(e, NETWORK_FALLBACK));
    }
  }
}

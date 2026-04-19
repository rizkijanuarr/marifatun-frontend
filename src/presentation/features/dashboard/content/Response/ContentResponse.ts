/** Selaras backend Laravel ContentResponse / list envelope. */

export type ContentUserDto = {
  id: string;
  name: string;
  email: string;
};

export type ContentApiDto = {
  id: string;
  user_id: string;
  content_type: string;
  topic: string;
  keywords: string | null;
  target_audience: string | null;
  tone: string;
  video_platform: string | null;
  video_key_message: string | null;
  video_cta: string | null;
  result: string | null;
  active: boolean;
  createdDate: string | null;
  modifiedDate: string | null;
  user: ContentUserDto | null;
};

export type ContentListStatistics = {
  total_contents: number;
};

/** `GET /api/v1/user/contents/statistics` — data untuk chart dashboard user. */
export type UserContentChartByType = { content_type: string; total: number };
export type UserContentChartByTone = { tone: string; total: number };
export type UserContentChartByMonth = { month: string; label: string; total: number };
export type UserContentChartByPlatform = { platform: string; total: number };
export type UserContentChartStatistics = {
  content_by_type: UserContentChartByType[];
  content_by_tone: UserContentChartByTone[];
  created_by_month: UserContentChartByMonth[];
  /** Konten `video_script` aktif per `video_platform` (kosong/null → `unknown`). */
  content_by_video_platform?: UserContentChartByPlatform[];
};

export type UserContentStatisticsEnvelope = {
  status: number;
  success: true;
  message: string;
  data: UserContentChartStatistics;
};

export type ContentListPaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number | null;
  to: number | null;
};

export type ContentListApiEnvelope = {
  status: number;
  success: true;
  message: string;
  data: ContentApiDto[];
  meta: {
    pagination: ContentListPaginationMeta;
    statistics?: ContentListStatistics;
  };
};

export type ContentDetailApiEnvelope = {
  status: number;
  success: true;
  message: string;
  data: ContentApiDto;
};

export type ContentMutationApiEnvelope = {
  status: number;
  success: true;
  message: string;
  data: ContentApiDto;
};

export type CreateContentPayload = {
  content_type: string;
  topic: string;
  keywords?: string;
  target_audience?: string;
  tone: string;
  video_platform?: string;
  video_key_message?: string;
  video_cta?: string;
};

export type UpdateContentPayload = CreateContentPayload;

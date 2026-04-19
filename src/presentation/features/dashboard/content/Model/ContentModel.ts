import type { ContentListPaginationMeta, ContentListStatistics } from '../Response/ContentResponse';

/** Mirror backend ContentTypeEnum / ToneEnum. */
export const CONTENT_TYPES = ['linkedin', 'x', 'thread', 'facebook', 'email_marketing', 'video_script'] as const;
export type ContentTypeId = (typeof CONTENT_TYPES)[number];

/** Selaras validasi backend `video_platform`. */
export const VIDEO_PLATFORMS = ['tiktok', 'instagram', 'linkedin'] as const;
export type VideoPlatformId = (typeof VIDEO_PLATFORMS)[number];

export const TONE_VALUES = [
  'formal',
  'casual',
  'persuasive',
  'friendly',
  'professional',
  'inspirational',
  'humorous',
] as const;
export type ToneId = (typeof TONE_VALUES)[number];

export type ContentListQuery = {
  page: number;
  per_page: number;
  search?: string;
  content_type?: string;
  /** ADMIN: true = hanya aktif, false = hanya tidak aktif; omit = semua */
  active?: boolean;
  date_from?: string;
  date_to?: string;
  /** Urut `modifiedDate` (admin & user). */
  sort_direction?: 'asc' | 'desc';
};

/** Sama seperti User: `all` = tidak kirim `active` ke API */
export type ContentActiveFilterDraft = 'all' | 'active' | 'inactive';

export type ContentFilterDraft = {
  search: string;
  content_type: string;
  active: ContentActiveFilterDraft;
  date_from: string;
  date_to: string;
  sort_direction: 'asc' | 'desc';
};

export type ContentRowModel = {
  id: string;
  topic: string;
  topicShort: string;
  content_type: string;
  contentTypeLabel: string;
  /** Kunci enum tone (untuk `t(enum.tone.*)`) */
  tone: string;
  /** Ringkas untuk sel; kosong → tampilkan em dash di UI */
  keywordsShort: string;
  /** Teks penuh untuk `title` tooltip */
  keywordsFull: string;
  ownerName: string;
  ownerEmail: string;
  /** false = dinonaktifkan (bukan dihapus dari DB) */
  active: boolean;
  createdLabel: string;
};

export type ContentDashboardModel = {
  rows: ContentRowModel[];
  pagination: ContentListPaginationMeta | null;
  /** ADMIN: dari meta.statistics */
  statistics: ContentListStatistics | null;
};

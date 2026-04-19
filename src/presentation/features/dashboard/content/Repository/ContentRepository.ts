import type { ContentDashboardModel, ContentListQuery } from '../Model/ContentModel';
import type {
  ContentApiDto,
  CreateContentPayload,
  UpdateContentPayload,
  UserContentChartStatistics,
} from '../Response/ContentResponse';

export interface ContentRepository {
  listContents(isAdmin: boolean, query: ContentListQuery): Promise<ContentDashboardModel>;
  getContent(id: string): Promise<ContentApiDto>;
  createContent(payload: CreateContentPayload): Promise<ContentApiDto>;
  updateContent(id: string, payload: UpdateContentPayload): Promise<ContentApiDto>;
  deleteContent(id: string): Promise<void>;
  /** Hanya akun user (bukan admin): `GET /api/v1/user/contents/statistics`. */
  fetchUserContentStatistics(): Promise<UserContentChartStatistics>;
}

/** Respons `data` dari `GET /api/v1/dashboard/admin` (Laravel `DashboardService::adminSummary`). */

export type AdminDashboardData = {
  total_users: number;
  total_contents: number;
  /** Key = nilai `content_type` (mis. `linkedin`), value = jumlah. */
  contents_by_type: Record<string, number>;
  users_by_role?: Array<{ role: string; total: number }>;
  content_status_breakdown?: { active: number; inactive: number };
  contents_by_tone?: Array<{ tone: string; total: number }>;
  contents_created_by_month?: Array<{ month: string; label: string; total: number }>;
};

/** Respons `data` dari `GET /api/v1/dashboard/user`. */
export type UserDashboardData = {
  total_contents: number;
  contents_by_type: Record<string, number>;
  recent_contents: Array<{
    id: string;
    content_type: string;
    topic: string;
    tone: string;
    createdDate: string | null;
  }>;
};

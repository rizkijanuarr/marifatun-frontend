import { AppPaths } from '../../../../core/common/AppPaths';

/** Maps `nav` from sidebar-nav.json to React Router paths. Keys must be lowercase — lookup uses `nav.toLowerCase()`. */
const NAV_TO_PATH: Record<string, string> = {
  dashboard: AppPaths.dashboard,
  user: AppPaths.user,
  content: AppPaths.content,
};

export function pathForSidebarNav(nav: string | undefined): string | null {
  if (!nav) return null;
  return NAV_TO_PATH[nav.toLowerCase()] ?? null;
}

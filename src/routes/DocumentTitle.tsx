import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AppPaths } from '../core/common/AppPaths';
import { useI18n } from '../presentation/components/i18n/useI18n';

/** Maps pathname → i18n key for `document.title` (must resolve to a string leaf). */
function titleKeyForPath(pathname: string): string {
  const p = pathname.replace(/\/$/, '') || '/';

  switch (p) {
    case '/':
      return 'front-desk.landing-page.meta.title';
    case AppPaths.login:
      return 'front-desk.auth-login.meta.title';
    case AppPaths.register:
      return 'front-desk.auth-register.meta.title';
    case AppPaths.forgotPassword:
      return 'front-desk.auth-forgot-password.meta.title';
    case AppPaths.dashboard:
      return 'back-desk.feature-dashboard.meta.title';
    case AppPaths.content:
      return 'back-desk.feature-content.meta.title';
    case AppPaths.user:
      return 'back-desk.feature-user.meta.title';
    case AppPaths.forbidden:
      return 'shell.error-pages.403.meta_title';
    case '/404':
      return 'shell.error-pages.404.meta_title';
    case AppPaths.serverError:
      return 'shell.error-pages.500.meta_title';
    default:
      return 'front-desk.landing-page.meta.title';
  }
}

/**
 * Syncs `<title>` with the current route and UI language.
 * Mount once inside `<BrowserRouter>`.
 */
export function DocumentTitle() {
  const { pathname } = useLocation();
  const { t, lang } = useI18n();

  useEffect(() => {
    document.title = t(titleKeyForPath(pathname));
  }, [pathname, lang, t]);

  return null;
}

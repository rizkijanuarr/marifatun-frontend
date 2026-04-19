import { Navigate, Outlet } from 'react-router-dom';
import { AppPaths } from '../core/common/AppPaths';
import { profileHasAdminRole } from '../core/common/authRoles';
import { getAuthUserProfile } from '../core/config/GlobalStorage/GlobalStorage';

/** Hanya role ADMIN (bukan MARIFATUN_USER). */
export function RequireAdmin() {
  const roles = getAuthUserProfile()?.roles;
  if (!profileHasAdminRole(roles)) {
    return <Navigate to={AppPaths.forbidden} replace />;
  }
  return <Outlet />;
}

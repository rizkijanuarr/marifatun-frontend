import { Navigate, Outlet } from 'react-router-dom';
import { AppPaths } from '../core/common/AppPaths';
import { getAuthToken } from '../core/config/GlobalStorage/GlobalStorage';

/** Layout guard: hanya render route anak jika ada token auth di storage. */
export function RequireAuth() {
  const token = getAuthToken();

  if (!token) {
    return <Navigate to={AppPaths.forbidden} replace />;
  }

  return <Outlet />;
}

import { profileHasAdminRole } from '../common/authRoles';
import { getAuthUserProfile } from '../config/GlobalStorage/GlobalStorage';

/** True jika profil menyimpan role admin (case-insensitive, mis. `ADMIN`). */
export function useIsAdmin(): boolean {
  return profileHasAdminRole(getAuthUserProfile()?.roles);
}

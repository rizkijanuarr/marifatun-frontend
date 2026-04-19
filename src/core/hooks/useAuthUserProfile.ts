import { getAuthUserProfile, type AuthUserProfile } from '../config/GlobalStorage/GlobalStorage';

/** Profil dari localStorage (baca ulang setiap render agar konsisten setelah login). */
export function useAuthUserProfile(): AuthUserProfile | null {
  return getAuthUserProfile();
}

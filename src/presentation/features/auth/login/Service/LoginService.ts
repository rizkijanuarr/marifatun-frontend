import { AppRoutes } from '../../../../../core/common/AppRoutes';
import type { ApiSuccessEnvelope } from '../../../../../core/network/apiTypes';
import type { AuthSessionData } from '../../../../../core/network/authTypes';
import { normalizeRolesFromApiUser } from '../../../../../core/common/authRoles';
import { setAuthToken, setAuthUserProfile } from '../../../../../core/config/GlobalStorage/GlobalStorage';
import { httpClient } from '../../../../../core/network/HttpClient';
import { parseApiError } from '../../../../../core/network/parseApiError';
import type { LoginRepository } from '../Repository/LoginRepository';
import type { LoginResult } from '../Repository/LoginRepository';

const NETWORK_FALLBACK = 'Tidak dapat terhubung ke server. Periksa koneksi atau coba lagi.';

export class LoginService implements LoginRepository {
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      const { data } = await httpClient.post<ApiSuccessEnvelope<AuthSessionData>>(AppRoutes.AUTH.LOGIN, {
        email,
        password,
      });
      if (data.success && data.data?.token) {
        setAuthToken(data.data.token);
        const u = data.data.user;
        setAuthUserProfile({
          name: (u?.name ?? '').trim(),
          email: (u?.email ?? email).trim(),
          roles: normalizeRolesFromApiUser(u),
        });
        return { ok: true, message: data.message };
      }
      return { ok: false, message: data.message ?? 'Login gagal.' };
    } catch (e) {
      return { ok: false, message: parseApiError(e, NETWORK_FALLBACK) };
    }
  }
}

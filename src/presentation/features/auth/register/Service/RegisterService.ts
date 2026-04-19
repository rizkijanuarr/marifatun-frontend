import { AppRoutes } from '../../../../../core/common/AppRoutes';
import type { ApiSuccessEnvelope } from '../../../../../core/network/apiTypes';
import type { AuthSessionData } from '../../../../../core/network/authTypes';
import { normalizeRolesFromApiUser } from '../../../../../core/common/authRoles';
import { setAuthToken, setAuthUserProfile } from '../../../../../core/config/GlobalStorage/GlobalStorage';
import { httpClient } from '../../../../../core/network/HttpClient';
import { parseApiError } from '../../../../../core/network/parseApiError';
import type { RegisterPayload } from '../Model/RegisterModel';
import type { RegisterRepository } from '../Repository/RegisterRepository';
import type { RegisterResult } from '../Repository/RegisterRepository';

const NETWORK_FALLBACK = 'Tidak dapat terhubung ke server. Periksa koneksi atau coba lagi.';

export class RegisterService implements RegisterRepository {
  async register(payload: RegisterPayload): Promise<RegisterResult> {
    try {
      const { data } = await httpClient.post<ApiSuccessEnvelope<AuthSessionData>>(AppRoutes.AUTH.REGISTER, payload);
      if (data.success && data.data?.token) {
        setAuthToken(data.data.token);
        const u = data.data.user;
        setAuthUserProfile({
          name: (u?.name ?? payload.name).trim(),
          email: (u?.email ?? payload.email).trim(),
          roles: normalizeRolesFromApiUser(u),
        });
        return { ok: true, message: data.message };
      }
      return { ok: false, message: data.message ?? 'Registrasi gagal.' };
    } catch (e) {
      return { ok: false, message: parseApiError(e, NETWORK_FALLBACK) };
    }
  }
}

import { AppRoutes } from '../../../../../core/common/AppRoutes';
import { clearAuthToken, clearAuthUserProfile, clearMockAuthenticated } from '../../../../../core/config/GlobalStorage/GlobalStorage';
import type { ApiSuccessEnvelope } from '../../../../../core/network/apiTypes';
import { httpClient } from '../../../../../core/network/HttpClient';
import { parseApiError } from '../../../../../core/network/parseApiError';
import type { LogoutRepository, LogoutResult } from '../Repository/LogoutRepository';
import type { LogoutResponseData } from '../Response/LogoutResponse';

const NETWORK_FALLBACK = 'Tidak dapat terhubung ke server. Sesi lokal telah dihapus.';

const clearSessionLocal = () => {
  clearAuthToken();
  clearAuthUserProfile();
  clearMockAuthenticated();
};

export class LogoutService implements LogoutRepository {
  async logout(): Promise<LogoutResult> {
    try {
      const { data } = await httpClient.post<ApiSuccessEnvelope<LogoutResponseData>>(
        AppRoutes.AUTH.LOGOUT,
        {},
      );
      clearSessionLocal();
      if (data.success) {
        return { ok: true, message: data.message };
      }
      return { ok: false, message: data.message ?? 'Logout gagal.' };
    } catch (e) {
      clearSessionLocal();
      return { ok: false, message: parseApiError(e, NETWORK_FALLBACK) };
    }
  }
}

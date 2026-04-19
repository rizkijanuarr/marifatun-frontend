import { AppRoutes } from '../../../../../core/common/AppRoutes';
import type { ApiSuccessEnvelope } from '../../../../../core/network/apiTypes';
import { httpClient } from '../../../../../core/network/HttpClient';
import { parseApiError } from '../../../../../core/network/parseApiError';
import type { ForgotPasswordRepository, ForgotPasswordSubmitResult } from '../Repository/ForgotPasswordRepository';
import type { ForgotPasswordData } from '../Response/ForgotPasswordResponse';

const NETWORK_FALLBACK = 'Tidak dapat terhubung ke server. Periksa koneksi atau coba lagi.';

export class ForgotPasswordService implements ForgotPasswordRepository {
  async submit(email: string, newPassword: string): Promise<ForgotPasswordSubmitResult> {
    try {
      const { data } = await httpClient.post<ApiSuccessEnvelope<ForgotPasswordData>>(
        AppRoutes.AUTH.FORGOT_PASSWORD,
        { email, new_password: newPassword },
      );
      if (data.success && data.data) {
        const message = data.data.message || data.message;
        return { ok: true, message };
      }
      return { ok: false, message: data.message ?? 'Permintaan gagal.' };
    } catch (e) {
      return { ok: false, message: parseApiError(e, NETWORK_FALLBACK) };
    }
  }
}

export type ForgotPasswordSubmitResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export interface ForgotPasswordRepository {
  submit(email: string, newPassword: string): Promise<ForgotPasswordSubmitResult>;
}

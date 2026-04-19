export type LoginResult = { ok: true; message: string } | { ok: false; message: string };

export interface LoginRepository {
  login(email: string, password: string): Promise<LoginResult>;
}

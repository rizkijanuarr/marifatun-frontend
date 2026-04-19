export type LogoutResult = { ok: true; message: string } | { ok: false; message: string };

export interface LogoutRepository {
  logout(): Promise<LogoutResult>;
}

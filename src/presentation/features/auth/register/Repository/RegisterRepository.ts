import type { RegisterPayload } from '../Model/RegisterModel';

export type RegisterResult = { ok: true; message: string } | { ok: false; message: string };

export interface RegisterRepository {
  register(payload: RegisterPayload): Promise<RegisterResult>;
}

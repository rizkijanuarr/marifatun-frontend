/** Shared API envelope shapes from the backend. */
export type ApiSuccessEnvelope<T> = {
  status: number;
  success: true;
  message: string;
  data: T;
};

export type ApiErrorBody = {
  status?: number;
  success?: false;
  message?: string;
  error_code?: string;
  errors?: Record<string, string[]>;
};

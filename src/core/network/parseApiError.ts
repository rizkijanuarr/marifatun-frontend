import axios from 'axios';
import type { ApiErrorBody } from './apiTypes';

const firstValidationMessage = (errors: Record<string, string[]> | undefined): string | null => {
  if (!errors) return null;
  for (const msgs of Object.values(errors)) {
    if (Array.isArray(msgs) && msgs[0]) return msgs[0];
  }
  return null;
};

/** Message suitable for toast.error from an API failure or thrown error. */
export const parseApiError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    if (data) {
      const fromFields = firstValidationMessage(data.errors);
      if (fromFields) return fromFields;
      if (data.message) return data.message;
    }
    if (error.message === 'Network Error') {
      return fallback;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

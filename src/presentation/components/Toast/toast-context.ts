import { createContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type ShowToastOptions = {
  type: ToastType;
  message: string;
  /** ms; default 4000. Use 0 to disable auto-dismiss. */
  duration?: number;
};

export type ToastContextValue = {
  show: (opts: ShowToastOptions) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

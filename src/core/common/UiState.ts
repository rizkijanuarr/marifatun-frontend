export type UiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

/** Runtime helpers; separate from the `UiState<T>` type name to avoid `import type`-only mistakes. */
export const ui = {
  idle: (): { status: 'idle' } => ({ status: 'idle' }),
  loading: (): { status: 'loading' } => ({ status: 'loading' }),
  success: <T>(data: T): { status: 'success'; data: T } => ({ status: 'success', data }),
  error: (message: string): { status: 'error'; message: string } => ({ status: 'error', message }),
};

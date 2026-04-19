import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext, type ShowToastOptions, type ToastType } from './toast-context';
import { useI18n } from '../i18n/useI18n';

const DEFAULT_DURATION = 4000;

type ToastEntry = {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
};

const icons: Record<ToastType, ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="5 12.5 10 17.5 19 7.5" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <circle cx="12" cy="7.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  ),
};

const closeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

type RowProps = {
  entry: ToastEntry;
  closeLabel: string;
  onRemove: (id: string) => void;
};

const ToastRow = ({ entry, closeLabel, onRemove }: RowProps) => {
  const { id, type, message, duration } = entry;
  const [phase, setPhase] = useState<'enter' | 'visible' | 'leave'>('enter');
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let a = 0;
    let b = 0;
    a = requestAnimationFrame(() => {
      b = requestAnimationFrame(() => setPhase('visible'));
    });
    return () => {
      cancelAnimationFrame(a);
      cancelAnimationFrame(b);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'visible' || duration <= 0) return;
    const t = setTimeout(() => setPhase('leave'), duration);
    return () => clearTimeout(t);
  }, [phase, duration]);

  useEffect(() => {
    if (phase !== 'leave') return;
    const node = rootRef.current;
    if (!node) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.target !== node) return;
      onRemove(id);
    };
    node.addEventListener('transitionend', onEnd);
    return () => node.removeEventListener('transitionend', onEnd);
  }, [phase, id, onRemove]);

  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  const visible = phase === 'visible';
  const leaving = phase === 'leave';

  return (
    <div
      ref={rootRef}
      className={`toast toast--${type}${visible ? ' is-visible' : ''}${leaving ? ' is-hiding' : ''}`}
      role={role}
      aria-live={ariaLive}
      style={
        duration > 0
          ? ({ ['--toast-duration' as string]: `${duration}ms` } as CSSProperties)
          : undefined
      }
    >
      <div className="toast__icon">{icons[type]}</div>
      <div className="toast__message">{message}</div>
      <button type="button" className="toast__close" aria-label={closeLabel} onClick={() => setPhase('leave')}>
        {closeIcon}
      </button>
      {duration > 0 ? <span className="toast__progress" /> : null}
    </div>
  );
};

type Props = { children: ReactNode };

export const ToastProvider = ({ children }: Props) => {
  const { t } = useI18n();
  const [items, setItems] = useState<ToastEntry[]>([]);

  const remove = useCallback((toastId: string) => {
    setItems((prev) => prev.filter((x) => x.id !== toastId));
  }, []);

  const show = useCallback((opts: ShowToastOptions) => {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `toast-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const duration = typeof opts.duration === 'number' ? opts.duration : DEFAULT_DURATION;
    setItems((prev) => [...prev, { id, type: opts.type, message: opts.message, duration }]);
  }, []);

  const value = useMemo(
    () => ({
      show,
      success: (message: string, duration?: number) => show({ type: 'success', message, duration }),
      error: (message: string, duration?: number) => show({ type: 'error', message, duration }),
      info: (message: string, duration?: number) => show({ type: 'info', message, duration }),
    }),
    [show],
  );

  const closeLabel = t('shell.toast.close_label');

  const portal =
    typeof document !== 'undefined'
      ? createPortal(
          <div className="toast-container" role="region" aria-label="Notifications">
            {items.map((entry) => (
              <ToastRow key={entry.id} entry={entry} closeLabel={closeLabel} onRemove={remove} />
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {portal}
    </ToastContext.Provider>
  );
};

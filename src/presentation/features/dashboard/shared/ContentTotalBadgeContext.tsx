import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ContentService } from '../content/Service/ContentService';

type Ctx = {
  /** `meta.pagination.total` dari GET /api/v1/contents (scope admin vs user mengikuti API). */
  totalContents: number;
  setTotalContents: (n: number) => void;
};

const ContentTotalBadgeContext = createContext<Ctx | null>(null);

const contentService = new ContentService();

export function ContentTotalBadgeProvider({ children }: { children: ReactNode }) {
  const [totalContents, setTotalContentsState] = useState(0);

  const setTotalContents = useCallback((n: number) => {
    setTotalContentsState(Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0);
  }, []);

  useEffect(() => {
    let cancelled = false;
    contentService
      .fetchTotalContentsInDb()
      .then((n) => {
        if (!cancelled) setTotalContents(n);
      })
      .catch(() => {
        if (!cancelled) setTotalContents(0);
      });
    return () => {
      cancelled = true;
    };
  }, [setTotalContents]);

  const value = useMemo(() => ({ totalContents, setTotalContents }), [totalContents, setTotalContents]);

  return <ContentTotalBadgeContext.Provider value={value}>{children}</ContentTotalBadgeContext.Provider>;
}

export function useContentTotalBadge(): Ctx {
  const ctx = useContext(ContentTotalBadgeContext);
  if (!ctx) {
    throw new Error('useContentTotalBadge must be used within ContentTotalBadgeProvider');
  }
  return ctx;
}

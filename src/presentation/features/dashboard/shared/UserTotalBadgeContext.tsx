import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { profileHasAdminRole } from '../../../../core/common/authRoles';
import { getAuthUserProfile } from '../../../../core/config/GlobalStorage/GlobalStorage';
import { UserService } from '../user/Service/UserService';

type Ctx = {
  /** `meta.total_users` dari GET /api/v1/users (null-safe → 0 di UI). */
  totalUsers: number;
  setTotalUsers: (n: number) => void;
};

const UserTotalBadgeContext = createContext<Ctx | null>(null);

const userService = new UserService();

export function UserTotalBadgeProvider({ children }: { children: ReactNode }) {
  const [totalUsers, setTotalUsersState] = useState(0);

  const setTotalUsers = useCallback((n: number) => {
    setTotalUsersState(Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0);
  }, []);

  useEffect(() => {
    if (!profileHasAdminRole(getAuthUserProfile()?.roles)) {
      setTotalUsers(0);
      return;
    }
    let cancelled = false;
    userService
      .fetchTotalUsersInDb()
      .then((n) => {
        if (!cancelled) setTotalUsers(n);
      })
      .catch(() => {
        if (!cancelled) setTotalUsers(0);
      });
    return () => {
      cancelled = true;
    };
  }, [setTotalUsers]);

  const value = useMemo(() => ({ totalUsers, setTotalUsers }), [totalUsers, setTotalUsers]);

  return <UserTotalBadgeContext.Provider value={value}>{children}</UserTotalBadgeContext.Provider>;
}

export function useUserTotalBadge(): Ctx {
  const ctx = useContext(UserTotalBadgeContext);
  if (!ctx) {
    throw new Error('useUserTotalBadge must be used within UserTotalBadgeProvider');
  }
  return ctx;
}

/** Format angka seperti badge sidebar (locale id: 1.248). */
export function formatSidebarUserCount(n: number): string {
  return new Intl.NumberFormat('id-ID').format(n);
}

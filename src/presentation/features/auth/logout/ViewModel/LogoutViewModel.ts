import { useCallback, useState } from 'react';
import type { LogoutResult } from '../Repository/LogoutRepository';
import { LogoutService } from '../Service/LogoutService';

const service = new LogoutService();

export const useLogoutViewModel = () => {
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async (): Promise<LogoutResult> => {
    setLoading(true);
    try {
      return await service.logout();
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, logout };
};

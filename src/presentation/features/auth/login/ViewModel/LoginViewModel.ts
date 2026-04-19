import { useCallback, useState } from 'react';
import type { LoginResult } from '../Repository/LoginRepository';
import { LoginService } from '../Service/LoginService';

const service = new LoginService();

export const useLoginViewModel = () => {
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setLoading(true);
    try {
      return await service.login(email, password);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, login };
};

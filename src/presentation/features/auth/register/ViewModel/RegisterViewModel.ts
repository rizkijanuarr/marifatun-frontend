import { useCallback, useState } from 'react';
import type { RegisterPayload } from '../Model/RegisterModel';
import type { RegisterResult } from '../Repository/RegisterRepository';
import { RegisterService } from '../Service/RegisterService';

const service = new RegisterService();

export const useRegisterViewModel = () => {
  const [loading, setLoading] = useState(false);

  const register = useCallback(async (payload: RegisterPayload): Promise<RegisterResult> => {
    setLoading(true);
    try {
      return await service.register(payload);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, register };
};

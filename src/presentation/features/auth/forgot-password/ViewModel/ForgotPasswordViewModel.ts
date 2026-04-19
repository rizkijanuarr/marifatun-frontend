import { useCallback, useState } from 'react';
import type { ForgotPasswordSubmitResult } from '../Repository/ForgotPasswordRepository';
import { ForgotPasswordService } from '../Service/ForgotPasswordService';

const service = new ForgotPasswordService();

export const useForgotPasswordViewModel = () => {
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async (email: string, newPassword: string): Promise<ForgotPasswordSubmitResult> => {
    setLoading(true);
    try {
      return await service.submit(email, newPassword);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, submit };
};

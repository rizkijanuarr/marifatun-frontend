import { useMemo, useState, type ReactNode } from 'react';
import { I18nContext, type I18nContextValue } from './i18n-context';
import { getLang, setLang, tByLang, type Lang } from '../../../core/config/Lang/i18n';

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(getLang());
  const setLanguage = (next: Lang) => {
    setLang(next);
    setLangState(next);
  };

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLanguage, t: (key: string) => tByLang(lang, key) }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

import { createContext } from 'react';
import type { Lang } from '../../../core/config/Lang/i18n';

export type I18nContextValue = {
  lang: Lang;
  setLanguage: (lang: Lang) => void;
  t: (key: string) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

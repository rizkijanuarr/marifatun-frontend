import en from '../../../../i18n/en.json';
import id from '../../../../i18n/id.json';
import my from '../../../../i18n/my.json';
import { DEFAULT_LANG, LANG_STORAGE_KEY } from '../../common/Constant';

export type Lang = 'id' | 'en' | 'my';
type Dict = Record<string, unknown>;

const dictionaries: Record<Lang, Dict> = { id, en, my };

const getByPath = (obj: unknown, path: string): string | null => {
  if (!obj || typeof obj !== 'object') return null;
  const out = path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') return null;
    return (acc as Record<string, unknown>)[key] ?? null;
  }, obj);
  return typeof out === 'string' ? out : null;
};

export const getLang = (): Lang => {
  const raw = localStorage.getItem(LANG_STORAGE_KEY);
  if (raw === 'id' || raw === 'en' || raw === 'my') return raw;
  return DEFAULT_LANG as Lang;
};

export const setLang = (lang: Lang): void => {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
};

export const tByLang = (lang: Lang, key: string): string => {
  return getByPath(dictionaries[lang], key) ?? getByPath(dictionaries.id, key) ?? key;
};

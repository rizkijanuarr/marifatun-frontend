import { useI18n } from './useI18n';

export const LangSwitch = ({ className }: { className?: string }) => {
  const { lang, setLanguage } = useI18n();
  return (
    <select
      className={className}
      aria-label="Language"
      value={lang}
      onChange={(e) => setLanguage(e.target.value as 'id' | 'en' | 'my')}
    >
      <option value="id">Indonesia</option>
      <option value="en">English</option>
      <option value="my">Malaysia</option>
    </select>
  );
};

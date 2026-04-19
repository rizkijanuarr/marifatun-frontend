import { useI18n } from "../../components/i18n/useI18n";

export const ServerErrorScreen = () => {
  const { t } = useI18n();
  return (
    <div className="error-page error-page--500">
      <div className="error-page__brand"><a className="error-page__brand-link" href="/"><img src="/assets/marifatun-mark.svg" alt="" width={40} height={40} />Marifatun</a></div>
      <div className="error-page__body">
        <div className="error-page__status">500</div>
        <h1 className="error-page__code">500</h1>
        <h2 className="error-page__title">{t('shell.error-pages.500.heading')}</h2>
        <p className="error-page__description">{t('shell.error-pages.500.description')}</p>
      </div>
      <footer className="error-page__footer">{t('shell.error-pages.common.copyright')}</footer>
    </div>
  );
};

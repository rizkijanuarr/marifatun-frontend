import { useI18n } from "../../components/i18n/useI18n";

export const NotFoundScreen = () => {
  const { t } = useI18n();
  return (
    <div className="error-page error-page--404">
      <div className="error-page__brand"><a className="error-page__brand-link" href="/"><img src="/assets/marifatun-mark.svg" alt="" width={40} height={40} />Marifatun</a></div>
      <div className="error-page__body">
        <div className="error-page__status">404</div>
        <h1 className="error-page__code">404</h1>
        <h2 className="error-page__title">{t('shell.error-pages.404.heading')}</h2>
        <p className="error-page__description">{t('shell.error-pages.404.description')}</p>
      </div>
      <footer className="error-page__footer">{t('shell.error-pages.common.copyright')}</footer>
    </div>
  );
};

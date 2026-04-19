import { useI18n } from "../../components/i18n/useI18n";

export const ForbiddenScreen = () => {
  const { t } = useI18n();
  return (
    <div className="error-page error-page--403">
      <div className="error-page__brand"><a className="error-page__brand-link" href="/"><img src="/assets/marifatun-mark.svg" alt="" width={40} height={40} />Marifatun</a></div>
      <div className="error-page__body">
        <div className="error-page__status">403</div>
        <h1 className="error-page__code">403</h1>
        <h2 className="error-page__title">{t('shell.error-pages.403.heading')}</h2>
        <p className="error-page__description">{t('shell.error-pages.403.description')}</p>
      </div>
      <footer className="error-page__footer">{t('shell.error-pages.common.copyright')}</footer>
    </div>
  );
};

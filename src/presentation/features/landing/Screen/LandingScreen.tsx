import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppPaths } from '../../../../core/common/AppPaths';
import { getAuthToken } from '../../../../core/config/GlobalStorage/GlobalStorage';
import { useI18n } from '../../../components/i18n/useI18n';

const langs = [
  { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'my', label: 'Malaysia', flag: '🇲🇾' },
] as const;

export const LandingScreen = () => {
  const { lang, setLanguage, t } = useI18n();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [langOpenMobile, setLangOpenMobile] = useState(false);
  const current = langs.find((l) => l.code === lang) ?? langs[0];

  const hasAuthToken = Boolean(getAuthToken());
  const primaryCtaTo = hasAuthToken ? AppPaths.dashboard : AppPaths.register;
  const backDashLabel = t('front-desk.landing-page.cta_back_dashboard');
  const navbarCtaLabel = hasAuthToken ? backDashLabel : t('front-desk.landing-page.navbar.cta_signup');
  const heroCtaLabel = hasAuthToken ? backDashLabel : t('front-desk.landing-page.hero.cta');
  const pricingExploreLabel = hasAuthToken ? backDashLabel : t('front-desk.landing-page.pricing.explore.cta');
  const pricingManiacLabel = hasAuthToken ? backDashLabel : t('front-desk.landing-page.pricing.maniac.cta');

  useEffect(() => {
    const navbar = document.querySelector('.navbar');
    const onScroll = () => navbar?.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const line = document.querySelector('.top-zone > .center-line') as HTMLElement | null;
    const runner = line?.querySelector('.center-line__runner') as HTMLElement | null;
    if (!line || !runner || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafPending = false;
    const update = () => {
      const lineH = line.offsetHeight;
      const runnerH = runner.offsetHeight;
      const maxTranslate = Math.max(0, lineH - runnerH);
      const doc = document.documentElement;
      const scrollMax = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollMax));
      runner.style.transform = `translateY(${progress * maxTranslate}px)`;
    };
    const onScroll = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        update();
        rafPending = false;
      });
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="canvas canvas--landing">
      <div className="bg-decor" aria-hidden="true">
        <div className="ellipses">
          <img className="ellipse ellipse--1" src="/assets/ellipse-33.svg" alt="" />
          {Array.from({ length: 9 }).map((_, i) => (
            <img key={i} className={`ellipse ellipse--${i + 2}`} src="/assets/ellipse-38.svg" alt="" />
          ))}
        </div>
      </div>

      <header className="navbar">
        <div className="navbar__inner">
          <Link to={AppPaths.home} className="brand navbar__brand">
            <img src="/assets/marifatun-mark.svg" alt="" className="brand__icon" width={48} height={48} />
            <span className="brand__name">Marifatun</span>
          </Link>

          <div className="navbar__actions">
            <div className="lang-select-wrap">
              <button type="button" className={`lang-select ${langOpen ? 'is-open' : ''}`} onClick={() => setLangOpen((s) => !s)}>
                <span className="lang-select__flag">{current.flag}</span>
                <span className="lang-select__label">{current.label}</span>
                <img src="/assets/arrow-down.svg" alt="" className="lang-select__arrow" />
              </button>
              {langOpen ? (
                <ul className="lang-dropdown">
                  {langs.map((l) => (
                    <li key={l.code}>
                      <button type="button" className={`lang-item ${lang === l.code ? 'is-active' : ''}`} onClick={() => { setLanguage(l.code); setLangOpen(false); }}>
                        <span className="lang-item__flag">{l.flag}</span>
                        <span className="lang-item__label">{l.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Link to={primaryCtaTo} className="btn btn--primary navbar__cta">
              {navbarCtaLabel}
            </Link>
          </div>

          <button type="button" className={`navbar__burger ${mobileMenu ? 'is-open' : ''}`} aria-label="Toggle menu" onClick={() => setMobileMenu((s) => !s)}>
            <span></span><span></span><span></span>
          </button>
        </div>

        {mobileMenu ? (
          <div className="navbar__mobile-menu">
            <div className="lang-select-wrap lang-select-wrap--mobile">
              <button type="button" className={`lang-select lang-select--mobile ${langOpenMobile ? 'is-open' : ''}`} onClick={() => setLangOpenMobile((s) => !s)}>
                <span className="lang-select__flag">{current.flag}</span>
                <span className="lang-select__label">{current.label}</span>
                <img src="/assets/arrow-down.svg" alt="" className="lang-select__arrow" />
              </button>
              {langOpenMobile ? (
                <ul className="lang-dropdown lang-dropdown--mobile">
                  {langs.map((l) => (
                    <li key={l.code}>
                      <button type="button" className={`lang-item ${lang === l.code ? 'is-active' : ''}`} onClick={() => { setLanguage(l.code); setLangOpenMobile(false); }}>
                        <span className="lang-item__flag">{l.flag}</span>
                        <span className="lang-item__label">{l.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Link to={primaryCtaTo} className="btn btn--primary">
              {navbarCtaLabel}
            </Link>
            {!hasAuthToken ? (
              <Link to={AppPaths.login} className="btn btn--outline">
                {t('front-desk.landing-page.navbar.cta_login')}
              </Link>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="top-zone">
        <div className="center-line" aria-hidden="true"><span className="center-line__runner"></span></div>

        <section className="hero">
          <span className="hero__badge">
            <img src="/assets/flag-indonesia.svg" alt="" />
            <span>{t('front-desk.landing-page.hero.badge')}</span>
          </span>
          <h1 className="hero__title">{t('front-desk.landing-page.hero.title')}</h1>
          <p className="hero__subtitle">{t('front-desk.landing-page.hero.subtitle')}</p>
          <Link to={primaryCtaTo} className="btn btn--primary btn--hero">
            {heroCtaLabel}
          </Link>
          <div className="hero__social-proof">
            <div className="hero__avatars">
              <img src="/assets/avatars/avatar-1.png" alt="User" className="avatar" />
              <img src="/assets/avatars/avatar-2.png" alt="User" className="avatar" />
              <img src="/assets/avatars/avatar-3.png" alt="User" className="avatar" />
              <img src="/assets/avatars/avatar-4.png" alt="User" className="avatar" />
            </div>
            <p className="hero__social-proof-text" dangerouslySetInnerHTML={{ __html: t('front-desk.landing-page.hero.social_proof') }} />
          </div>
          <img src="/assets/hero-screenshot.png" alt="Marifatun app screenshot" className="hero__screenshot" />
        </section>

        <section className="steps">
          <header className="steps__header">
            <h2 className="steps__title">{t('front-desk.landing-page.steps.title')}</h2>
            <p className="steps__subtitle">{t('front-desk.landing-page.steps.subtitle')}</p>
          </header>
          <ol className="steps__timeline">
            <li className="step step--right"><div className="step__bullet"><img src="/assets/ellipse-47.svg" alt="" /><span className="step__number">1</span></div><div className="step__text"><h3>{t('front-desk.landing-page.steps.step_1_title')}</h3><p>{t('front-desk.landing-page.steps.step_1_desc')}</p></div></li>
            <li className="step step--left"><div className="step__text"><h3>{t('front-desk.landing-page.steps.step_2_title')}</h3><p>{t('front-desk.landing-page.steps.step_2_desc')}</p></div><div className="step__bullet"><img src="/assets/ellipse-47.svg" alt="" /><span className="step__number">2</span></div></li>
            <li className="step step--right"><div className="step__bullet"><img src="/assets/ellipse-47.svg" alt="" /><span className="step__number">3</span></div><div className="step__text"><h3>{t('front-desk.landing-page.steps.step_3_title')}</h3><p>{t('front-desk.landing-page.steps.step_3_desc')}</p></div></li>
          </ol>
        </section>
      </div>

      <section className="pricing">
        <header className="pricing__header">
          <h2 className="pricing__title">{t('front-desk.landing-page.pricing.title')}</h2>
          <p className="pricing__subtitle">{t('front-desk.landing-page.pricing.subtitle')}</p>
        </header>
        <div className="pricing__grid">
          <article className="plan plan--explore">
            <header className="plan__header"><h3 className="plan__name">Explore</h3><div className="plan__price">Rp0</div><div className="plan__period">{t('front-desk.landing-page.pricing.explore.period')}</div></header>
            <ul className="plan__features">
              <li><img src="/assets/check-icon.svg" alt="" /><span>{t('front-desk.landing-page.pricing.explore.feat_1')}</span></li>
              <li><img src="/assets/check-icon.svg" alt="" /><span>{t('front-desk.landing-page.pricing.explore.feat_2')}</span></li>
              <li><img src="/assets/check-icon.svg" alt="" /><span>{t('front-desk.landing-page.pricing.explore.feat_3')}</span></li>
              <li><img src="/assets/check-icon.svg" alt="" /><span>{t('front-desk.landing-page.pricing.explore.feat_4')}</span></li>
            </ul>
            <Link to={primaryCtaTo} className="btn btn--outline plan__cta">
              {pricingExploreLabel}
            </Link>
          </article>
          <article className="plan plan--maniac">
            <header className="plan__header"><h3 className="plan__name">Maniac</h3><div className="plan__price">Rp999</div><div className="plan__period">{t('front-desk.landing-page.pricing.maniac.period')}</div></header>
            <ul className="plan__features">
              <li><img src="/assets/check-icon.svg" alt="" /><span>{t('front-desk.landing-page.pricing.maniac.feat_1')}</span></li>
              <li><img src="/assets/check-icon.svg" alt="" /><span>{t('front-desk.landing-page.pricing.maniac.feat_2')}</span></li>
              <li><img src="/assets/check-icon.svg" alt="" /><span>{t('front-desk.landing-page.pricing.maniac.feat_3')}</span></li>
            </ul>
            <Link to={primaryCtaTo} className="btn btn--dark plan__cta">
              {pricingManiacLabel}
            </Link>
          </article>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <Link to={AppPaths.home} className="brand footer__brand"><img src="/assets/marifatun-mark.svg" alt="" className="brand__icon" width={48} height={48} /><span className="brand__name">Marifatun</span></Link>
          <nav className="footer__nav">
            <ul className="footer__col"><li className="footer__col-head">{t('front-desk.landing-page.footer.col_company')}</li><li><a href="#">{t('front-desk.landing-page.footer.link_support')}</a></li><li><a href="#">{t('front-desk.landing-page.footer.link_feedback')}</a></li><li><a href="#">{t('front-desk.landing-page.footer.link_twitter')}</a></li></ul>
            <ul className="footer__col"><li className="footer__col-head">{t('front-desk.landing-page.footer.col_legal')}</li><li><a href="#">{t('front-desk.landing-page.footer.link_privacy')}</a></li><li><a href="#">{t('front-desk.landing-page.footer.link_terms')}</a></li></ul>
            <ul className="footer__col"><li className="footer__col-head">{t('front-desk.landing-page.footer.col_product')}</li><li><a href="#">{t('front-desk.landing-page.footer.link_changelog')}</a></li><li><a href="#">{t('front-desk.landing-page.footer.link_roadmap')}</a></li><li><a href="#">{t('front-desk.landing-page.footer.link_blog')}</a></li></ul>
          </nav>
        </div>
        <div className="footer__meta"><span className="footer__built">{t('front-desk.landing-page.footer.built')}</span><span className="footer__copyright">{t('front-desk.landing-page.footer.copyright')}</span></div>
      </footer>
    </div>
  );
};

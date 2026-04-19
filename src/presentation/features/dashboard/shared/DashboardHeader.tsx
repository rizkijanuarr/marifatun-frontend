import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppPaths } from '../../../../core/common/AppPaths';
import { profileHasAdminRole } from '../../../../core/common/authRoles';
import { useToast } from '../../../components/Toast/useToast';
import { useI18n } from '../../../components/i18n/useI18n';
import { useLogoutViewModel } from '../../auth/logout/ViewModel/LogoutViewModel';
import rawSidebarNav from '../config/sidebar-nav.json';
import rawSidebarNavUser from '../config/sidebar-nav-user.json';
import type { SidebarNavConfig } from '../config/sidebarNav.types';
import { pathForSidebarNav } from '../config/navPathMap';
import { initialsForProfile } from '../../../../core/common/userDisplay';
import { useAuthUserProfile } from '../../../../core/hooks/useAuthUserProfile';
import { useContentTotalBadge } from './ContentTotalBadgeContext';
import { formatSidebarUserCount, useUserTotalBadge } from './UserTotalBadgeContext';

const SIDEBAR_NAV = rawSidebarNav as SidebarNavConfig;
const SIDEBAR_NAV_USER = rawSidebarNavUser as SidebarNavConfig;
const I18N_SIDEBAR_PREFIX = 'back-desk.sidebar-panel.';

function injectSidebarIconClass(svg: string | undefined): string {
  if (!svg) return '';
  return svg.replace(/<svg\b(?![^>]*\bclass=)/, '<svg class="sidebar__item-icon"');
}

const SCROLL_THRESHOLD = 8;
const COLLAPSE_KEY = 'dash:collapsed';

type Props = {
  title: string;
  subtitle: string;
  action1?: ReactNode;
  action2?: ReactNode;
  children: ReactNode;
};

const langOptions = [
  { code: 'id', flag: '🇮🇩', label: 'Indonesia' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'my', flag: '🇲🇾', label: 'Malaysia' },
] as const;

export const DashboardHeader = ({ title, subtitle, action1, action2, children }: Props) => {
  const { totalUsers } = useUserTotalBadge();
  const { totalContents } = useContentTotalBadge();
  const authProfile = useAuthUserProfile();
  const isAdmin = profileHasAdminRole(authProfile?.roles);
  const sidebarName = authProfile?.name?.trim() || '—';
  const sidebarEmail = authProfile?.email?.trim() || '—';
  const sidebarInitials = initialsForProfile(authProfile);
  const { lang, setLanguage, t } = useI18n();
  const toast = useToast();
  const { loading: logoutLoading, logout } = useLogoutViewModel();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [topbarScrolled, setTopbarScrolled] = useState(false);

  const footerRef = useRef<HTMLDivElement>(null);
  const langSwitchRef = useRef<HTMLDivElement>(null);

  const currentLang = useMemo(
    () => langOptions.find((item) => item.code === lang) ?? langOptions[0],
    [lang],
  );

  const navGroups = useMemo(
    () =>
      [...((isAdmin ? SIDEBAR_NAV : SIDEBAR_NAV_USER).groups ?? [])]
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map((g) => ({
          ...g,
          items: [...(g.items ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
        })),
    [isAdmin],
  );

  useEffect(() => {
    let raf = false;
    const onScroll = () => {
      if (raf) return;
      raf = true;
      requestAnimationFrame(() => {
        setTopbarScrolled(window.scrollY > SCROLL_THRESHOLD);
        raf = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (langSwitchRef.current && !langSwitchRef.current.contains(target)) {
        setLangOpen(false);
      }
      if (footerRef.current && !footerRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const persistCollapse = (next: boolean) => {
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
  };

  const userBackdrop =
    typeof document !== 'undefined'
      ? createPortal(
          <div
            className={`user-menu-backdrop ${menuOpen ? 'is-open' : ''}`}
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />,
          document.body,
        )
      : null;

  return (
    <>
      {userBackdrop}
      <div className={`dash ${collapsed ? 'is-collapsed' : ''}`}>
        <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`} id="sidebar" data-i18n-scope="back-desk.sidebar-panel">
          <Link to={AppPaths.dashboard} className="sidebar__brand">
            <img src="/assets/marifatun-mark.svg" alt="" className="sidebar__brand-mark" width={36} height={36} />
            <span className="sidebar__brand-name">Marifatun</span>
          </Link>

          <nav className="sidebar__nav" data-sidebar-nav>
            {navGroups.map((group, gIdx) => (
              <Fragment key={`${group.index ?? 'g'}-${gIdx}`}>
                {gIdx > 0 ? <hr className="sidebar__separator" aria-hidden /> : null}
                {group.label ? (
                  <div className="sidebar__group-label">
                    {group.label_key ? t(`${I18N_SIDEBAR_PREFIX}${group.label_key}`) : group.label}
                  </div>
                ) : null}
                {(group.items ?? []).map((item, iIdx) => {
                  const to = pathForSidebarNav(item.nav);
                  if (!to) {
                    if (import.meta.env.DEV) console.warn('[sidebar-nav] Unknown `nav`, add navPathMap entry:', item.nav);
                    return null;
                  }
                  const active = location.pathname === to;
                  const label = item.label_key ? t(`${I18N_SIDEBAR_PREFIX}${item.label_key}`) : (item.label ?? '');
                  const iconHtml = injectSidebarIconClass(item.icon);
                  return (
                    <Link
                      key={`${item.index ?? 'i'}-${item.nav}-${iIdx}`}
                      to={to}
                      className={`sidebar__item ${active ? 'is-active' : ''}`}
                      data-nav={item.nav ?? ''}
                    >
                      {iconHtml ? (
                        <span
                          style={{ display: 'contents' }}
                          dangerouslySetInnerHTML={{ __html: iconHtml }}
                        />
                      ) : null}
                      <span className="sidebar__item-label">{label}</span>
                      {isAdmin && item.nav === 'user' ? (
                        <span className="sidebar__count">{formatSidebarUserCount(totalUsers)}</span>
                      ) : item.nav === 'content' ? (
                        <span className="sidebar__count">{formatSidebarUserCount(totalContents)}</span>
                      ) : item.count != null && item.count !== '' ? (
                        <span className="sidebar__count">{item.count}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </Fragment>
            ))}
          </nav>

          <div ref={footerRef} className={`sidebar__footer ${menuOpen ? 'is-open' : ''}`} data-user-menu>
            <button
              type="button"
              className="sidebar__user"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((s) => !s);
              }}
            >
              <span className="sidebar__user-avatar">{sidebarInitials}</span>
              <div className="sidebar__user-info">
                <span className="sidebar__user-name">{sidebarName}</span>
                <span className="sidebar__user-email">{sidebarEmail}</span>
              </div>
              <svg className="sidebar__user-caret" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
            <div className="sidebar__user-menu" role="menu">
              <button
                type="button"
                className="sidebar__user-menu-item sidebar__user-menu-item--danger"
                role="menuitem"
                disabled={logoutLoading}
                aria-busy={logoutLoading}
                onClick={async () => {
                  setMenuOpen(false);
                  const res = await logout();
                  if (res.ok) {
                    toast.success(res.message);
                  } else {
                    toast.error(res.message);
                  }
                  navigate(AppPaths.login, { replace: true });
                }}
              >
                <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>{t('back-desk.sidebar-panel.logout')}</span>
              </button>
            </div>
          </div>
        </aside>

        <button type="button" className={`sidebar-backdrop ${mobileOpen ? 'is-open' : ''}`} onClick={() => setMobileOpen(false)} aria-label="close sidebar" />

        <main className="main">
          <header className={`topbar ${topbarScrolled ? 'is-scrolled' : ''}`} data-i18n-scope="back-desk.header-panel">
            <div className="topbar__left">
              <button
                className="topbar__burger"
                type="button"
                aria-label={t('back-desk.header-panel.burger_label')}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileOpen((s) => !s);
                    return;
                  }
                  setCollapsed((s) => {
                    const next = !s;
                    persistCollapse(next);
                    return next;
                  });
                }}
              >
                <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </button>
              <div>
                <div className="topbar__title">{title}</div>
                <div className="topbar__subtitle">{subtitle}</div>
              </div>
            </div>

            <div className="topbar__right">
              <div className="topbar__actions">
                {action1}
                {action2}
              </div>
              <div ref={langSwitchRef} className={`lang-switch ${langOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="lang-switch__trigger"
                  aria-label={t('back-desk.header-panel.lang_trigger_label')}
                  aria-expanded={langOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLangOpen((s) => !s);
                  }}
                >
                  <span className="lang-switch__flag">{currentLang.flag}</span>
                  <span className="lang-switch__label">{currentLang.label}</span>
                  <svg className="lang-switch__caret" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div className="lang-switch__menu" role="listbox">
                  {langOptions.map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      className={`lang-switch__item ${lang === item.code ? 'is-active' : ''}`}
                      onClick={() => {
                        setLanguage(item.code);
                        setLangOpen(false);
                      }}
                    >
                      <span className="lang-switch__flag">{item.flag}</span>
                      <span>{item.label}</span>
                      <svg className="lang-switch__check" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <section className="page">{children}</section>
        </main>
      </div>
    </>
  );
};

import { Link } from 'react-router-dom';
import { AppPaths } from '../../../../../core/common/AppPaths';
import { StatisticChart } from '../../../../components/StatisticChart/StatisticChart';
import { DashboardHeader } from '../../shared/DashboardHeader';
import { overviewChartIcons } from '../../shared/dashboardIcons';
import { useDashboardViewModel } from '../ViewModel/DashboardViewModel';
import type { DashboardChartDef } from '../Model/DashboardModel';
import { profileHasAdminRole } from '../../../../../core/common/authRoles';
import { useAuthUserProfile } from '../../../../../core/hooks/useAuthUserProfile';
import { useI18n } from '../../../../components/i18n/useI18n';

function chartBadge(def: DashboardChartDef, t: (key: string) => string) {
  const text = def.badgeLiteral ?? (def.badgeKey ? t(def.badgeKey) : undefined);
  if (!text) return undefined;
  const v = def.badgeVariant ?? 'muted';
  return <span className={`badge badge--${v}`}>{text}</span>;
}

export const DashboardScreen = () => {
  const { t } = useI18n();
  const authProfile = useAuthUserProfile();
  const vm = useDashboardViewModel();
  const isAdmin = profileHasAdminRole(authProfile?.roles);

  return (
    <DashboardHeader
      title={t('back-desk.feature-dashboard.header.title')}
      subtitle={t('back-desk.feature-dashboard.header.subtitle')}
      action1={
        isAdmin ? (
          <Link to={AppPaths.user} className="btn-d btn-d--primary">
            <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" width="16" height="16" aria-hidden>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="btn-d__label">{t('back-desk.feature-dashboard.header.manage_users')}</span>
          </Link>
        ) : (
          <Link to={AppPaths.content} className="btn-d btn-d--primary">
            <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" width="16" height="16" aria-hidden>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span className="btn-d__label">{t('back-desk.feature-dashboard.header.manage_content')}</span>
          </Link>
        )
      }
    >
      {vm.page.status === 'loading' ? <p className="dash-loading">{t('back-desk.feature-dashboard.loading')}</p> : null}
      {vm.page.status === 'error' ? <p role="alert">{vm.page.message}</p> : null}
      {vm.page.status === 'success' ? (
        <>
          <section className="banner">
            <div>
              <h1 className="banner__title">
                {t('back-desk.feature-dashboard.banner.greeting')}{' '}
                <span className="banner__highlight">
                  {authProfile?.name?.trim() || vm.page.data.banner.userName}
                </span>
              </h1>
              <p className="banner__subtitle">{t('back-desk.feature-dashboard.banner.subtitle')}</p>
            </div>
          </section>

          <section className="charts-grid">
            {vm.page.data.charts.map((c) => {
              const chartLabels = c.labelKeys?.length
                ? c.labelKeys.map((k) => t(k))
                : c.labels;
              return (
                <StatisticChart
                  key={c.titleKey}
                  title={t(c.titleKey)}
                  subtitle={t(c.subtitleKey)}
                  icon={overviewChartIcons[c.preset]}
                  badge={chartBadge(c, t)}
                  preset={c.preset}
                  labels={chartLabels}
                  values={c.values}
                />
              );
            })}
          </section>
        </>
      ) : null}
    </DashboardHeader>
  );
};

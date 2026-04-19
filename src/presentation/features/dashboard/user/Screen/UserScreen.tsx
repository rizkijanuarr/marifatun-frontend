import { useEffect, useMemo } from 'react';
import { DashboardHeader } from '../../shared/DashboardHeader';
import {
  overviewChartIcons,
  TableIconDelete,
  TableIconEdit,
  TableIconView,
  userStatIcons,
} from '../../shared/dashboardIcons';
import { StatisticCard } from '../../../../components/StatisticCard/StatisticCard';
import { StatisticChart } from '../../../../components/StatisticChart/StatisticChart';
import { DataTable } from '../../../../components/Table/DataTable';
import { UserModals } from '../Components/UserModals';
import { useUserViewModel } from '../ViewModel/UserViewModel';
import type { UserChartDef, UserStatDef } from '../Model/UserModel';
import { useI18n } from '../../../../components/i18n/useI18n';
import { useUserTotalBadge } from '../../shared/UserTotalBadgeContext';

function translateStatTitle(s: UserStatDef, t: (key: string) => string) {
  let txt = t(s.titleKey);
  if (s.titleParams) {
    for (const [k, v] of Object.entries(s.titleParams)) {
      txt = txt.split(`{${k}}`).join(v);
    }
  }
  return txt;
}

function userChartBadge(def: UserChartDef, t: (key: string) => string) {
  const text = def.badgeLiteral ?? (def.badgeKey ? t(def.badgeKey) : undefined);
  if (!text) return undefined;
  const v = def.badgeVariant ?? 'muted';
  return <span className={`badge badge--${v}`}>{text}</span>;
}

export const UserManagementScreen = () => {
  const { t } = useI18n();
  const { setTotalUsers } = useUserTotalBadge();
  const vm = useUserViewModel();

  useEffect(() => {
    if (vm.page.status === 'success') {
      setTotalUsers(vm.page.data.totalUsersInDb ?? 0);
    }
  }, [vm.page, setTotalUsers]);

  const columns = [
    { key: 'user', label: t('back-desk.feature-user.table.col_user') },
    { key: 'plan', label: t('back-desk.feature-user.table.col_role') },
    { key: 'status', label: t('back-desk.feature-user.table.col_status') },
    { key: 'joined', label: t('back-desk.feature-user.table.col_joined') },
    { key: 'actions', label: t('back-desk.feature-user.table.col_actions') },
  ];

  const tableSummary = useMemo(() => {
    if (vm.page.status !== 'success' || !vm.page.data.pagination) return '';
    const m = vm.page.data.pagination;
    const from = m.from ?? 0;
    const to = m.to ?? 0;
    const filtered = m.total;
    const allDb = vm.page.data.totalUsersInDb;
    return t('back-desk.feature-user.table.summary_range')
      .replace('{from}', String(from))
      .replace('{to}', String(to))
      .replace('{filtered}', String(filtered))
      .replace('{all}', allDb != null ? String(allDb) : '—');
  }, [vm.page, t]);

  const pagination = vm.page.status === 'success' ? vm.page.data.pagination : null;

  return (
    <>
      <DashboardHeader
        title={t('back-desk.feature-user.header.title')}
        subtitle={t('back-desk.feature-user.header.subtitle')}
        action1={(
          <button type="button" className="btn-d btn-d--ghost" onClick={() => vm.openFilterDrawer()}>
            <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" width="16" height="16" aria-hidden>
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="btn-d__label">{t('back-desk.feature-user.header.btn_filter')}</span>
          </button>
        )}
        action2={(
          <button type="button" className="btn-d btn-d--primary" onClick={() => vm.openModal('create')}>
            <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" width="16" height="16" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="btn-d__label">{t('back-desk.feature-user.header.btn_create')}</span>
          </button>
        )}
      >
        {vm.page.status === 'loading' ? <p className="dash-loading">{t('back-desk.feature-user.table.loading')}</p> : null}
        {vm.page.status === 'error' ? <p role="alert">{vm.page.message}</p> : null}
        {vm.page.status === 'success' ? (
          <>
            {vm.page.data.stats.length > 0 ? (
              <section className="grid-stats">
                {vm.page.data.stats.map((s) => (
                  <StatisticCard
                    key={s.id}
                    title={translateStatTitle(s, t)}
                    value={s.value}
                    icon={userStatIcons[s.icon]}
                    meta={<span className={`badge ${s.badgeClass}`}>{t(s.badgeKey)}</span>}
                  />
                ))}
              </section>
            ) : null}

            {vm.page.data.chartsPrimary.length > 0 ? (
              <section className="charts-grid">
                {vm.page.data.chartsPrimary.map((c) => (
                  <StatisticChart
                    key={c.titleKey}
                    title={t(c.titleKey)}
                    subtitle={t(c.subtitleKey)}
                    icon={overviewChartIcons[c.preset]}
                    badge={userChartBadge(c, t)}
                    preset={c.preset}
                    labels={c.labels}
                    values={c.values}
                  />
                ))}
              </section>
            ) : null}

            {vm.page.data.chartsSecondary.length > 0 ? (
              <section className="charts-grid">
                {vm.page.data.chartsSecondary.map((c) => (
                  <StatisticChart
                    key={`${c.titleKey}-secondary`}
                    title={t(c.titleKey)}
                    subtitle={t(c.subtitleKey)}
                    icon={overviewChartIcons[c.preset]}
                    badge={userChartBadge(c, t)}
                    preset={c.preset}
                    labels={c.labels}
                    values={c.values}
                  />
                ))}
              </section>
            ) : null}

            <DataTable
              columns={columns}
              summary={tableSummary || t('back-desk.feature-user.table.summary_empty')}
              rows={vm.page.data.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="table__user">
                      <span className="table__avatar">{row.initials}</span>
                      <div className="table__primary">
                        <span className="table__primary-name">{row.name}</span>
                        <span className="table__primary-sub">{row.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={row.planBadgeClass}>{row.plan}</span>
                  </td>
                  <td>
                    <span className={row.statusBadgeClass}>{t(row.statusKey)}</span>
                  </td>
                  <td>{row.joined}</td>
                  <td>
                    <div className="table__actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={t('back-desk.feature-user.table.aria_view')}
                        onClick={() => vm.openModal('view', row)}
                      >
                        {TableIconView}
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={t('back-desk.feature-user.table.aria_edit')}
                        onClick={() => vm.openModal('edit', row)}
                      >
                        {TableIconEdit}
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        aria-label={t('back-desk.feature-user.table.aria_delete')}
                        onClick={() => vm.openModal('delete', row)}
                      >
                        {TableIconDelete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              pagination={
                pagination && pagination.last_page > 0 ? (
                  <>
                    <button
                      type="button"
                      disabled={pagination.current_page <= 1}
                      onClick={() => vm.goToPage(pagination.current_page - 1)}
                      aria-label={t('back-desk.feature-user.table.pagination_prev')}
                    >
                      &lsaquo;
                    </button>
                    <span className="pagination__info">
                      {t('back-desk.feature-user.table.pagination_page')
                        .replace('{current}', String(pagination.current_page))
                        .replace('{last}', String(pagination.last_page))}
                    </span>
                    <button
                      type="button"
                      disabled={pagination.current_page >= pagination.last_page}
                      onClick={() => vm.goToPage(pagination.current_page + 1)}
                      aria-label={t('back-desk.feature-user.table.pagination_next')}
                    >
                      &rsaquo;
                    </button>
                  </>
                ) : null
              }
            />
          </>
        ) : null}
      </DashboardHeader>

      <UserModals
        filterOpen={vm.filterOpen}
        setFilterOpen={vm.setFilterOpen}
        filterSearchDraft={vm.filterSearchDraft}
        setFilterSearchDraft={vm.setFilterSearchDraft}
        filterActiveDraft={vm.filterActiveDraft}
        setFilterActiveDraft={vm.setFilterActiveDraft}
        onApplyFilters={vm.applyFilters}
        onResetFilters={vm.resetFilters}
        modal={vm.modal}
        selectedRow={vm.selectedRow}
        onModalClose={vm.closeModal}
        onSwitchToEdit={() => vm.openModal('edit', vm.selectedRow ?? undefined)}
        viewDetail={vm.viewDetail}
        viewLoading={vm.viewLoading}
        mutationLoading={vm.mutationLoading}
        createUser={vm.createUser}
        updateUser={vm.updateUser}
        deleteUser={vm.deleteUser}
      />
    </>
  );
};

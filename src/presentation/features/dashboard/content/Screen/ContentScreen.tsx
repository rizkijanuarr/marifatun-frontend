import { useEffect, useMemo } from 'react';
import { DataTable } from '../../../../components/Table/DataTable';
import { StatisticCard } from '../../../../components/StatisticCard/StatisticCard';
import { useI18n } from '../../../../components/i18n/useI18n';
import { statIcons, TableIconDelete, TableIconEdit, TableIconView } from '../../shared/dashboardIcons';
import { useContentTotalBadge } from '../../shared/ContentTotalBadgeContext';
import { DashboardHeader } from '../../shared/DashboardHeader';
import { ContentModals } from '../Components/ContentModals';
import { UserContentCharts } from '../Components/UserContentCharts';
import { TONE_VALUES } from '../Model/ContentModel';
import { useContentViewModel } from '../ViewModel/ContentViewModel';

const isKnownTone = (tone: string): tone is (typeof TONE_VALUES)[number] =>
  (TONE_VALUES as readonly string[]).includes(tone);

export const ContentManagementScreen = () => {
  const { t } = useI18n();
  const { setTotalContents } = useContentTotalBadge();
  const vm = useContentViewModel();

  useEffect(() => {
    if (vm.page.status === 'success' && vm.page.data.pagination) {
      setTotalContents(vm.page.data.pagination.total);
    }
  }, [vm.page, setTotalContents]);

  const columns = [
    { key: 'topic', label: t('back-desk.feature-content.table.col_topic') },
    { key: 'owner', label: t('back-desk.feature-content.table.col_owner') },
    { key: 'status', label: t('back-desk.feature-content.table.col_status') },
    { key: 'created', label: t('back-desk.feature-content.table.col_created') },
    { key: 'actions', label: t('back-desk.feature-content.table.col_actions') },
  ];

  const tableSummary = useMemo(() => {
    if (vm.page.status !== 'success' || !vm.page.data.pagination) return '';
    const m = vm.page.data.pagination;
    const from = m.from ?? 0;
    const to = m.to ?? 0;
    const filtered = m.total;
    return t('back-desk.feature-content.table.summary_range')
      .replace('{from}', String(from))
      .replace('{to}', String(to))
      .replace('{filtered}', String(filtered));
  }, [vm.page, t]);

  const pagination = vm.page.status === 'success' ? vm.page.data.pagination : null;
  const stats = vm.page.status === 'success' ? vm.page.data.statistics : null;

  return (
    <>
      <DashboardHeader
        title={t('back-desk.feature-content.header.title')}
        subtitle={t('back-desk.feature-content.header.subtitle')}
        action1={(
          <button type="button" className="btn-d btn-d--ghost" onClick={() => vm.openFilterDrawer()}>
            <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" width="16" height="16" aria-hidden>
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="btn-d__label">{t('back-desk.feature-content.header.btn_filter')}</span>
          </button>
        )}
        action2={(
          <button type="button" className="btn-d btn-d--primary" onClick={() => vm.openModal('create')}>
            <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" width="16" height="16" aria-hidden>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="btn-d__label">{t('back-desk.feature-content.header.btn_create')}</span>
          </button>
        )}
      >
        {vm.page.status === 'loading' ? <p className="dash-loading">{t('back-desk.feature-content.table.loading')}</p> : null}
        {vm.page.status === 'error' ? <p role="alert">{vm.page.message}</p> : null}
        {vm.page.status === 'success' ? (
          <>
            {vm.isAdmin && stats ? (
              <section className="grid-stats">
                <StatisticCard
                  title={t('back-desk.feature-content.stat.total_contents')}
                  value={String(stats.total_contents)}
                  icon={statIcons.document}
                  meta={<span className="badge badge--muted">{t('back-desk.feature-content.stat.total_badge')}</span>}
                />
              </section>
            ) : null}

            {!vm.isAdmin && vm.userChartStats.status === 'loading' ? (
              <p className="dash-loading">{t('back-desk.feature-content.charts.loading')}</p>
            ) : null}
            {!vm.isAdmin && vm.userChartStats.status === 'error' ? (
              <p className="content-user-charts__error" role="alert">
                {vm.userChartStats.message}
              </p>
            ) : null}
            {!vm.isAdmin && vm.userChartStats.status === 'success' ? (
              <UserContentCharts stats={vm.userChartStats.data} />
            ) : null}

            <DataTable
              columns={columns}
              summary={tableSummary || t('back-desk.feature-content.table.summary_empty')}
              rows={vm.page.data.rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="content-cell-topic-wrap">
                      <p className="content-cell-topic-wrap__topic" title={row.topic}>
                        {row.topicShort}
                      </p>
                      <dl className="content-cell-topic-wrap__meta">
                        <div className="content-cell-topic-wrap__line">
                          <dt>{t('back-desk.feature-content.table.col_type')}</dt>
                          <dd>
                            <span className="badge badge--muted">{row.contentTypeLabel}</span>
                          </dd>
                        </div>
                        <div className="content-cell-topic-wrap__line">
                          <dt>{t('back-desk.feature-content.table.col_tone')}</dt>
                          <dd>
                            {!row.tone
                              ? '—'
                              : isKnownTone(row.tone)
                                ? t(`back-desk.feature-content.enum.tone.${row.tone}`)
                                : row.tone}
                          </dd>
                        </div>
                        <div className="content-cell-topic-wrap__line content-cell-topic-wrap__line--keywords">
                          <dt>{t('back-desk.feature-content.table.col_keywords')}</dt>
                          <dd>{row.keywordsFull ? row.keywordsFull : '—'}</dd>
                        </div>
                      </dl>
                    </div>
                  </td>
                  <td>
                    <div className="table__primary">
                      <span className="table__primary-name">{row.ownerName}</span>
                      <span className="table__primary-sub">{row.ownerEmail}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${row.active ? 'badge--success' : 'badge--inactive'}`}>
                      {row.active ? t('back-desk.feature-content.table.status_active') : t('back-desk.feature-content.table.status_inactive')}
                    </span>
                  </td>
                  <td>{row.createdLabel}</td>
                  <td>
                    <div className="table__actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={t('back-desk.feature-content.table.aria_view')}
                        onClick={() => vm.openModal('view', row)}
                      >
                        {TableIconView}
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={t('back-desk.feature-content.table.aria_edit')}
                        onClick={() => vm.openModal('edit', row)}
                      >
                        {TableIconEdit}
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn--danger"
                        disabled={!row.active}
                        aria-label={t('back-desk.feature-content.table.aria_deactivate')}
                        title={row.active ? undefined : t('back-desk.feature-content.table.deactivate_disabled_hint')}
                        onClick={() => row.active && vm.openModal('delete', row)}
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
                      aria-label={t('back-desk.feature-content.table.pagination_prev')}
                    >
                      &lsaquo;
                    </button>
                    <span className="pagination__info">
                      {t('back-desk.feature-content.table.pagination_page')
                        .replace('{current}', String(pagination.current_page))
                        .replace('{last}', String(pagination.last_page))}
                    </span>
                    <button
                      type="button"
                      disabled={pagination.current_page >= pagination.last_page}
                      onClick={() => vm.goToPage(pagination.current_page + 1)}
                      aria-label={t('back-desk.feature-content.table.pagination_next')}
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

      <ContentModals
        isAdmin={vm.isAdmin}
        filterOpen={vm.filterOpen}
        setFilterOpen={vm.setFilterOpen}
        filterDraft={vm.filterDraft}
        setFilterDraft={vm.setFilterDraft}
        onApplyFilters={vm.applyFilters}
        onResetFilters={vm.resetFilters}
        modal={vm.modal}
        selectedRow={vm.selectedRow}
        onModalClose={vm.closeModal}
        onSwitchToEdit={() => vm.openModal('edit', vm.selectedRow ?? undefined)}
        detail={vm.detail}
        detailLoading={vm.detailLoading}
        mutationLoading={vm.mutationLoading}
        creatingContentLoading={vm.creatingContentLoading}
        createContent={vm.createContent}
        updateContent={vm.updateContent}
        deleteContent={vm.deleteContent}
      />
    </>
  );
};

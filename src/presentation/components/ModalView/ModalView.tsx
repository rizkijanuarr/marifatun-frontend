import type { UserApiDto } from '../../features/dashboard/user/Response/UserResponse';
import type { UserRowModel } from '../../features/dashboard/user/Model/UserModel';
import { useI18n } from '../i18n/useI18n';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  row: UserRowModel | null;
  apiUser?: UserApiDto | null;
  detailLoading?: boolean;
  onEdit: () => void;
};

const formatIso = (iso: string | undefined): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export const ModalView = ({
  open,
  onClose,
  title,
  subtitle,
  row,
  apiUser,
  detailLoading,
  onEdit,
}: Props) => {
  const { t } = useI18n();

  const rolesLabel = apiUser?.roles?.length ? apiUser.roles.join(', ') : row?.plan ?? '—';

  return (
    <div
      className={`modal ${open ? 'is-open' : ''}`}
      id="modalView"
      aria-hidden={!open}
      role="dialog"
      aria-labelledby="modalViewTitle"
    >
      <button type="button" className="modal__backdrop" aria-hidden onClick={onClose} />
      <div className="modal__dialog" role="document">
        <div className="modal__header">
          <div className="modal__title-group">
            <h2 className="modal__title" id="modalViewTitle">
              <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {title}
            </h2>
            <span className="modal__subtitle">{subtitle}</span>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label={t('back-desk.modal-view.close_label')}
          >
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal__body">
          {detailLoading ? <p>{t('back-desk.modal-view.loading')}</p> : null}
          {!detailLoading && row && (
            <>
              <div className="detail-header">
                <span className="detail-avatar">{row.initials}</span>
                <div className="detail-header__info">
                  <div className="detail-header__name">{apiUser?.name ?? row.name}</div>
                  <div className="detail-header__sub">{apiUser?.email ?? row.email}</div>
                  <div className="detail-header__badges">
                    <span className={row.planBadgeClass}>{rolesLabel}</span>
                    <span className={row.statusBadgeClass}>{t(row.statusKey)}</span>
                  </div>
                </div>
              </div>

              <dl className="detail-list">
                <div className="detail-row">
                  <dt>{t('back-desk.modal-view.detail_roles')}</dt>
                  <dd>{rolesLabel}</dd>
                </div>
                <div className="detail-row">
                  <dt>{t('back-desk.modal-view.detail_joined')}</dt>
                  <dd>{formatIso(apiUser?.createdDate) !== '—' ? formatIso(apiUser?.createdDate) : row.joined}</dd>
                </div>
                {apiUser?.modifiedDate ? (
                  <div className="detail-row">
                    <dt>{t('back-desk.modal-view.detail_modified')}</dt>
                    <dd>{formatIso(apiUser.modifiedDate)}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          )}
        </div>

        <div className="modal__footer">
          <button type="button" className="btn-d btn-d--ghost" onClick={onClose}>
            {t('back-desk.modal-view.btn_close')}
          </button>
          <button type="button" className="btn-d btn-d--primary" onClick={onEdit} disabled={detailLoading}>
            <svg
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              width={16}
              height={16}
              aria-hidden
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>{t('back-desk.modal-view.btn_edit')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

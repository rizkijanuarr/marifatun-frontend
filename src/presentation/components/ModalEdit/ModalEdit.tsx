import type { UserRowModel } from '../../features/dashboard/user/Model/UserModel';
import { useI18n } from '../i18n/useI18n';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  submitLabel: string;
  row: UserRowModel | null;
  disabled?: boolean;
  onSubmit?: () => void;
};

export const ModalEdit = ({
  open,
  onClose,
  title,
  subtitle,
  submitLabel,
  row,
  disabled,
  onSubmit,
}: Props) => {
  const { t } = useI18n();

  const defaultRole = row?.primaryRole ?? 'MARIFATUN_USER';
  const defaultActive = row?.active === false ? 'false' : 'true';

  return (
    <div
      className={`modal ${open ? 'is-open' : ''}`}
      id="modalEdit"
      aria-hidden={!open}
      role="dialog"
      aria-labelledby="modalEditTitle"
    >
      <button type="button" className="modal__backdrop" aria-hidden onClick={onClose} />
      <div className="modal__dialog" role="document">
        <div className="modal__header">
          <div className="modal__title-group">
            <h2 className="modal__title" id="modalEditTitle">
              <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {title}
            </h2>
            <span className="modal__subtitle">{subtitle}</span>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label={t('back-desk.modal-edit.close_label')}
          >
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form
          id="user-edit-form"
          className="modal__body"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
        >
          <div className="form-grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor="editName">
                {t('back-desk.modal-edit.field_name')}
              </label>
              <input
                id="editName"
                name="name"
                className="filter-input"
                type="text"
                key={row?.id}
                defaultValue={row?.name ?? ''}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="editEmail">
                {t('back-desk.modal-edit.field_email')}
              </label>
              <input
                id="editEmail"
                name="email"
                className="filter-input"
                type="email"
                key={row?.id}
                defaultValue={row?.email ?? ''}
                required
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="editRole">
                {t('back-desk.modal-edit.field_role')}
              </label>
              <select
                id="editRole"
                name="role"
                className="filter-input"
                key={`${row?.id}-role`}
                defaultValue={defaultRole}
                required
              >
                <option value="MARIFATUN_USER">{t('back-desk.modal-edit.role_marifatun_user')}</option>
                <option value="ADMIN">{t('back-desk.modal-edit.role_admin')}</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="editActive">
                {t('back-desk.modal-edit.field_active')}
              </label>
              <select
                id="editActive"
                name="active"
                className="filter-input"
                key={`${row?.id}-active`}
                defaultValue={defaultActive}
                required
              >
                <option value="true">{t('back-desk.modal-edit.status_active')}</option>
                <option value="false">{t('back-desk.modal-edit.status_inactive')}</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="editPassword">
                {t('back-desk.modal-edit.field_password_new')}
              </label>
              <input
                id="editPassword"
                name="password"
                className="filter-input"
                type="password"
                autoComplete="new-password"
                key={row?.id}
                placeholder={t('back-desk.modal-edit.placeholder_password_optional')}
              />
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn-d btn-d--ghost" onClick={onClose}>
              {t('back-desk.modal-edit.btn_cancel')}
            </button>
            <button type="submit" className="btn-d btn-d--primary" disabled={disabled}>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

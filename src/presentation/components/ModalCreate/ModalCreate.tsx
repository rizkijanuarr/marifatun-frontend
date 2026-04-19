import { useI18n } from '../i18n/useI18n';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  submitLabel: string;
  disabled?: boolean;
  onSubmit?: () => void;
};

export const ModalCreate = ({
  open,
  onClose,
  title,
  subtitle,
  submitLabel,
  disabled,
  onSubmit,
}: Props) => {
  const { t } = useI18n();

  return (
    <div
      className={`modal ${open ? 'is-open' : ''}`}
      id="modalCreate"
      data-modal
      aria-hidden={!open}
      role="dialog"
      aria-labelledby="modalCreateTitle"
    >
      <button type="button" className="modal__backdrop" aria-hidden onClick={onClose} />
      <div className="modal__dialog" role="document">
        <div className="modal__header">
          <div className="modal__title-group">
            <h2 className="modal__title" id="modalCreateTitle">
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {title}
            </h2>
            <span className="modal__subtitle">{subtitle}</span>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label={t('back-desk.modal-create.close_label')}
          >
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form
          id="user-create-form"
          className="modal__body"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.();
          }}
        >
          <div className="form-grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor="createName">
                {t('back-desk.modal-create.field_name')}
              </label>
              <input
                id="createName"
                name="name"
                className="filter-input"
                type="text"
                autoComplete="name"
                required
                placeholder={t('back-desk.modal-create.placeholder_name')}
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="createEmail">
                {t('back-desk.modal-create.field_email')}
              </label>
              <input
                id="createEmail"
                name="email"
                className="filter-input"
                type="email"
                autoComplete="email"
                required
                placeholder={t('back-desk.modal-create.placeholder_email')}
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="createRole">
                {t('back-desk.modal-create.field_role')}
              </label>
              <select id="createRole" name="role" className="filter-input" required defaultValue="MARIFATUN_USER">
                <option value="MARIFATUN_USER">{t('back-desk.modal-create.role_marifatun_user')}</option>
                <option value="ADMIN">{t('back-desk.modal-create.role_admin')}</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="createActive">
                {t('back-desk.modal-create.field_active')}
              </label>
              <select id="createActive" name="active" className="filter-input" required defaultValue="true">
                <option value="true">{t('back-desk.modal-create.status_active')}</option>
                <option value="false">{t('back-desk.modal-create.status_inactive')}</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor="createPassword">
                {t('back-desk.modal-create.field_password')}
              </label>
              <input
                id="createPassword"
                name="password"
                className="filter-input"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder={t('back-desk.modal-create.placeholder_password')}
              />
            </div>
          </div>

          <div className="modal__footer">
            <button type="button" className="btn-d btn-d--ghost" onClick={onClose}>
              {t('back-desk.modal-create.btn_cancel')}
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

import { useI18n } from "../i18n/useI18n";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  submitLabel: string;
  disabled?: boolean;
  onConfirm?: () => void;
};

export const ModalDelete = ({ open, onClose, title, message, submitLabel, disabled, onConfirm }: Props) => {
  const { t } = useI18n();

  return (
    <div
      className={`modal ${open ? 'is-open' : ''}`}
      id="modalDelete"
      data-modal
      aria-hidden={!open}
      role="alertdialog"
      aria-labelledby="modalDeleteTitle"
      aria-describedby="modalDeleteDesc"
    >
      <button type="button" className="modal__backdrop" aria-hidden onClick={onClose} />
      <div className="modal__dialog modal__dialog--sm" role="document">
        <div className="modal__header">
          <div className="modal__title-group">
            <h2 className="modal__title modal__title--danger" id="modalDeleteTitle">
              <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {title}
            </h2>
            <span className="modal__subtitle" id="modalDeleteDesc">
              {t('back-desk.modal-delete.subtitle_default')}
            </span>
          </div>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label={t('back-desk.modal-delete.close_label')}
          >
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal__body">
          <p className="modal__message">{message}</p>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn-d btn-d--ghost" onClick={onClose}>
            {t('back-desk.modal-delete.btn_cancel')}
          </button>
          <button
            type="button"
            className="btn-d btn-d--danger"
            disabled={disabled}
            onClick={() => {
              onConfirm?.();
            }}
          >
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
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

import { useEffect } from 'react';
import { FilterDrawer } from '../../../../components/FilterDrawer/FilterDrawer';
import { ModalCreate } from '../../../../components/ModalCreate/ModalCreate';
import { ModalDelete } from '../../../../components/ModalDelete/ModalDelete';
import { ModalEdit } from '../../../../components/ModalEdit/ModalEdit';
import { ModalView } from '../../../../components/ModalView/ModalView';
import { useToast } from '../../../../components/Toast/useToast';
import type { UserRole, UserRowModel } from '../Model/UserModel';
import type { CreateUserPayload, UpdateUserPayload, UserApiDto } from '../Response/UserResponse';
import { useI18n } from '../../../../components/i18n/useI18n';

export type UserModalState = 'create' | 'edit' | 'view' | 'delete' | null;

type Props = {
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  filterSearchDraft: string;
  setFilterSearchDraft: (v: string) => void;
  filterActiveDraft: 'all' | 'active' | 'inactive';
  setFilterActiveDraft: (v: 'all' | 'active' | 'inactive') => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  modal: UserModalState;
  selectedRow: UserRowModel | null;
  onModalClose: () => void;
  onSwitchToEdit: () => void;
  viewDetail: UserApiDto | null;
  viewLoading: boolean;
  mutationLoading: boolean;
  createUser: (payload: CreateUserPayload) => Promise<void>;
  updateUser: (id: string, payload: UpdateUserPayload) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

const isUserRole = (v: string): v is UserRole => v === 'ADMIN' || v === 'MARIFATUN_USER';

export const UserModals = ({
  filterOpen,
  setFilterOpen,
  filterSearchDraft,
  setFilterSearchDraft,
  filterActiveDraft,
  setFilterActiveDraft,
  onApplyFilters,
  onResetFilters,
  modal,
  selectedRow,
  onModalClose,
  onSwitchToEdit,
  viewDetail,
  viewLoading,
  mutationLoading,
  createUser,
  updateUser,
  deleteUser,
}: Props) => {
  const { t } = useI18n();
  const toast = useToast();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (filterOpen) setFilterOpen(false);
      else if (modal) onModalClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filterOpen, modal, setFilterOpen, onModalClose]);

  const handleCreateSubmit = async () => {
    const el = document.getElementById('user-create-form') as HTMLFormElement | null;
    if (!el) return;
    const fd = new FormData(el);
    const roleRaw = String(fd.get('role') ?? '');
    if (!isUserRole(roleRaw)) {
      toast.error(t('back-desk.feature-user.toast.invalid_role'));
      return;
    }
    const payload: CreateUserPayload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      password: String(fd.get('password') ?? ''),
      role: roleRaw,
      active: fd.get('active') === 'true',
    };
    try {
      await createUser(payload);
      toast.success(t('back-desk.feature-user.toast.user_created'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('back-desk.feature-user.toast.mutation_failed'));
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRow) return;
    const el = document.getElementById('user-edit-form') as HTMLFormElement | null;
    if (!el) return;
    const fd = new FormData(el);
    const roleRaw = String(fd.get('role') ?? '');
    if (!isUserRole(roleRaw)) {
      toast.error(t('back-desk.feature-user.toast.invalid_role'));
      return;
    }
    const password = String(fd.get('password') ?? '').trim();
    const payload: UpdateUserPayload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      role: roleRaw,
      active: fd.get('active') === 'true',
    };
    if (password) payload.password = password;
    try {
      await updateUser(selectedRow.id, payload);
      toast.success(t('back-desk.feature-user.toast.user_updated'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('back-desk.feature-user.toast.mutation_failed'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;
    try {
      await deleteUser(selectedRow.id);
      toast.success(t('back-desk.feature-user.toast.user_deleted'));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t('back-desk.feature-user.toast.mutation_failed'));
    }
  };

  return (
    <>
      <FilterDrawer
        open={filterOpen}
        title={t('back-desk.feature-user.filter.title')}
        onClose={() => setFilterOpen(false)}
        footer={(
          <>
            <button
              type="button"
              className="btn-d btn-d--ghost"
              onClick={() => {
                onResetFilters();
              }}
            >
              {t('back-desk.modal-filter.btn_reset')}
            </button>
            <button
              type="button"
              className="btn-d btn-d--primary"
              onClick={() => {
                onApplyFilters();
                toast.success(t('back-desk.feature-user.toast.filter_applied'));
              }}
            >
              {t('back-desk.modal-filter.btn_apply')}
            </button>
          </>
        )}
      >
        <div className="filter-group">
          <label className="filter-group__label" htmlFor="fdSearch">
            <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>{t('back-desk.modal-filter.group_search')}</span>
          </label>
          <div className="filter-search">
            <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="fdSearch"
              className="filter-input"
              type="search"
              value={filterSearchDraft}
              onChange={(e) => setFilterSearchDraft(e.target.value)}
              placeholder={t('back-desk.feature-user.filter.search_placeholder')}
            />
          </div>
          <span className="form-field__hint">{t('back-desk.feature-user.filter.search_hint')}</span>
        </div>

        <div className="filter-group">
          <span className="filter-group__label">{t('back-desk.modal-filter.group_status')}</span>
          <div className="filter-chips">
            <button
              type="button"
              className={`filter-chip ${filterActiveDraft === 'all' ? 'is-active' : ''}`}
              onClick={() => setFilterActiveDraft('all')}
            >
              {t('back-desk.modal-filter.chip_all')}
            </button>
            <button
              type="button"
              className={`filter-chip ${filterActiveDraft === 'active' ? 'is-active' : ''}`}
              onClick={() => setFilterActiveDraft('active')}
            >
              {t('back-desk.modal-filter.chip_active')}
            </button>
            <button
              type="button"
              className={`filter-chip ${filterActiveDraft === 'inactive' ? 'is-active' : ''}`}
              onClick={() => setFilterActiveDraft('inactive')}
            >
              {t('back-desk.modal-filter.chip_inactive')}
            </button>
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group__label">{t('back-desk.modal-filter.group_range')}</span>
          <div className="filter-range">
            <input
              type="date"
              className="filter-input"
              aria-label={t('back-desk.modal-filter.date_from_label')}
            />
            <input
              type="date"
              className="filter-input"
              aria-label={t('back-desk.modal-filter.date_to_label')}
            />
          </div>
        </div>

        <hr className="filter-divider" />

        <div className="filter-group">
          <label className="filter-group__label" htmlFor="fdSort">
            {t('back-desk.modal-filter.group_sort')}
          </label>
          <select id="fdSort" className="filter-input">
            <option>{t('back-desk.modal-filter.sort_newest')}</option>
            <option>{t('back-desk.modal-filter.sort_oldest')}</option>
            <option>{t('back-desk.modal-filter.sort_az')}</option>
            <option>{t('back-desk.modal-filter.sort_za')}</option>
          </select>
        </div>
      </FilterDrawer>

      <ModalCreate
        key={`mc-${modal}`}
        open={modal === 'create'}
        onClose={onModalClose}
        title={t('back-desk.feature-user.modals.create_title')}
        subtitle={t('back-desk.feature-user.modals.create_subtitle')}
        submitLabel={t('back-desk.feature-user.modals.create_submit')}
        disabled={mutationLoading}
        onSubmit={handleCreateSubmit}
      />

      <ModalEdit
        key={`me-${selectedRow?.id ?? 'x'}-${modal}`}
        open={modal === 'edit'}
        onClose={onModalClose}
        title={t('back-desk.feature-user.modals.edit_title')}
        subtitle={t('back-desk.feature-user.modals.edit_subtitle')}
        submitLabel={t('back-desk.feature-user.modals.edit_submit')}
        row={selectedRow}
        disabled={mutationLoading}
        onSubmit={handleEditSubmit}
      />

      <ModalView
        open={modal === 'view'}
        onClose={onModalClose}
        title={t('back-desk.feature-user.modals.view_title')}
        subtitle={t('back-desk.feature-user.modals.view_subtitle')}
        row={selectedRow}
        apiUser={viewDetail}
        detailLoading={viewLoading}
        onEdit={onSwitchToEdit}
      />

      <ModalDelete
        open={modal === 'delete'}
        onClose={onModalClose}
        title={t('back-desk.feature-user.modals.delete_title')}
        message={t('back-desk.feature-user.modals.delete_message')}
        submitLabel={t('back-desk.feature-user.modals.delete_submit')}
        disabled={mutationLoading}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { type UiState, ui } from '../../../../../core/common/UiState';
import type { UserDashboardModel, UserRowModel } from '../Model/UserModel';
import type { CreateUserPayload, UpdateUserPayload, UserApiDto, UserListQuery } from '../Response/UserResponse';
import { UserService } from '../Service/UserService';

const service = new UserService();

export const useUserViewModel = () => {
  const [page, setPage] = useState<UiState<UserDashboardModel>>(ui.loading());
  const [listQuery, setListQuery] = useState<UserListQuery>({ page: 1, per_page: 15 });
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearchDraft, setFilterSearchDraft] = useState('');
  const [filterActiveDraft, setFilterActiveDraft] = useState<'all' | 'active' | 'inactive'>('all');
  const [modal, setModal] = useState<'create' | 'edit' | 'view' | 'delete' | null>(null);
  const [selectedRow, setSelectedRow] = useState<UserRowModel | null>(null);
  const [viewDetail, setViewDetail] = useState<UserApiDto | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setPage(ui.loading());
    try {
      const res = await service.getUsersDashboard(listQuery);
      setPage(ui.success(res));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal memuat data user.';
      setPage(ui.error(msg));
    }
  }, [listQuery]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadUsers();
    });
  }, [loadUsers]);

  const openFilterDrawer = useCallback(() => {
    setFilterSearchDraft(listQuery.search ?? '');
    setFilterActiveDraft(
      listQuery.active === undefined ? 'all' : listQuery.active ? 'active' : 'inactive',
    );
    setFilterOpen(true);
  }, [listQuery.active, listQuery.search]);

  const applyFilters = useCallback(() => {
    setPage(ui.loading());
    setListQuery((q) => ({
      ...q,
      page: 1,
      search: filterSearchDraft.trim() || undefined,
      active: filterActiveDraft === 'all' ? undefined : filterActiveDraft === 'active',
    }));
    setFilterOpen(false);
  }, [filterActiveDraft, filterSearchDraft]);

  const resetFilters = useCallback(() => {
    setPage(ui.loading());
    setFilterSearchDraft('');
    setFilterActiveDraft('all');
    setListQuery((q) => ({ page: 1, per_page: q.per_page, search: undefined, active: undefined }));
    setFilterOpen(false);
  }, []);

  const goToPage = useCallback((next: number) => {
    setPage(ui.loading());
    setListQuery((q) => ({ ...q, page: next }));
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelectedRow(null);
    setViewDetail(null);
    setViewLoading(false);
  }, []);

  const openModal = useCallback(
    (type: 'create' | 'edit' | 'view' | 'delete', row?: UserRowModel) => {
      if (row) setSelectedRow(row);
      else if (type === 'create') setSelectedRow(null);
      setModal(type);
      if (type === 'view' && row) {
        setViewDetail(null);
        setViewLoading(true);
        service
          .getUser(row.id)
          .then((u) => setViewDetail(u))
          .catch(() => setViewDetail(null))
          .finally(() => setViewLoading(false));
      } else {
        setViewDetail(null);
        setViewLoading(false);
      }
    },
    [],
  );

  const createUser = useCallback(
    async (payload: CreateUserPayload) => {
      setMutationLoading(true);
      try {
        await service.createUser(payload);
        closeModal();
        await loadUsers();
      } finally {
        setMutationLoading(false);
      }
    },
    [closeModal, loadUsers],
  );

  const updateUser = useCallback(
    async (userId: string, payload: UpdateUserPayload) => {
      setMutationLoading(true);
      try {
        await service.updateUser(userId, payload);
        closeModal();
        await loadUsers();
      } finally {
        setMutationLoading(false);
      }
    },
    [closeModal, loadUsers],
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      setMutationLoading(true);
      try {
        await service.deleteUser(userId);
        closeModal();
        await loadUsers();
      } finally {
        setMutationLoading(false);
      }
    },
    [closeModal, loadUsers],
  );

  return useMemo(
    () => ({
      page,
      listQuery,
      filterOpen,
      setFilterOpen,
      filterSearchDraft,
      setFilterSearchDraft,
      filterActiveDraft,
      setFilterActiveDraft,
      openFilterDrawer,
      applyFilters,
      resetFilters,
      goToPage,
      modal,
      setModal,
      selectedRow,
      openModal,
      closeModal,
      viewDetail,
      viewLoading,
      mutationLoading,
      createUser,
      updateUser,
      deleteUser,
    }),
    [
      page,
      listQuery,
      filterOpen,
      filterSearchDraft,
      filterActiveDraft,
      openFilterDrawer,
      applyFilters,
      resetFilters,
      goToPage,
      modal,
      selectedRow,
      openModal,
      closeModal,
      viewDetail,
      viewLoading,
      mutationLoading,
      createUser,
      updateUser,
      deleteUser,
    ],
  );
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { profileHasAdminRole } from '../../../../../core/common/authRoles';
import type { UiState } from '../../../../../core/common/UiState';
import { ui } from '../../../../../core/common/UiState';
import { useAuthUserProfile } from '../../../../../core/hooks/useAuthUserProfile';
import type {
  ContentDashboardModel,
  ContentFilterDraft,
  ContentListQuery,
  ContentRowModel,
} from '../Model/ContentModel';
import type {
  ContentApiDto,
  CreateContentPayload,
  UpdateContentPayload,
  UserContentChartStatistics,
} from '../Response/ContentResponse';
import { ContentService, mapContentApiDtoToRowModel } from '../Service/ContentService';

const service = new ContentService();

function initialListQuery(): ContentListQuery {
  return {
    page: 1,
    per_page: 15,
    sort_direction: 'desc',
  };
}

function emptyFilterDraft(): ContentFilterDraft {
  return {
    search: '',
    content_type: '',
    active: 'all',
    date_from: '',
    date_to: '',
    sort_direction: 'desc',
  };
}

export const useContentViewModel = () => {
  const authProfile = useAuthUserProfile();
  const isAdmin = profileHasAdminRole(authProfile?.roles);

  const [page, setPage] = useState<UiState<ContentDashboardModel>>(ui.loading());
  const [listQuery, setListQuery] = useState<ContentListQuery>(initialListQuery);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<ContentFilterDraft>(() => emptyFilterDraft());

  const [modal, setModal] = useState<'create' | 'edit' | 'view' | 'delete' | null>(null);
  const [selectedRow, setSelectedRow] = useState<ContentRowModel | null>(null);
  const [detail, setDetail] = useState<ContentApiDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  /** Fullscreen blur + dots setelah submit create, sampai API selesai lalu buka view. */
  const [creatingContentLoading, setCreatingContentLoading] = useState(false);
  /** Statistik chart (role user): `GET /api/v1/user/contents/statistics`. */
  const [userChartStats, setUserChartStats] = useState<UiState<UserContentChartStatistics>>(ui.idle());

  const refreshUserCharts = useCallback(async () => {
    if (isAdmin) return;
    setUserChartStats(ui.loading());
    try {
      const data = await service.fetchUserContentStatistics();
      setUserChartStats(ui.success(data));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal memuat statistik konten.';
      setUserChartStats(ui.error(msg));
    }
  }, [isAdmin]);

  const loadContents = useCallback(async () => {
    setPage(ui.loading());
    try {
      const res = await service.listContents(isAdmin, listQuery);
      setPage(ui.success(res));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal memuat data konten.';
      setPage(ui.error(msg));
      return;
    }
    await refreshUserCharts();
  }, [isAdmin, listQuery, refreshUserCharts]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadContents();
    });
  }, [loadContents]);

  const openFilterDrawer = useCallback(() => {
    let active: ContentFilterDraft['active'] = 'all';
    if (listQuery.active === true) active = 'active';
    else if (listQuery.active === false) active = 'inactive';

    setFilterDraft({
      search: listQuery.search ?? '',
      content_type: listQuery.content_type ?? '',
      active,
      date_from: listQuery.date_from ?? '',
      date_to: listQuery.date_to ?? '',
      sort_direction: listQuery.sort_direction === 'asc' ? 'asc' : 'desc',
    });
    setFilterOpen(true);
  }, [listQuery]);

  const applyFilters = useCallback(() => {
    const perPageDefault = 15;

    setPage(ui.loading());
    setListQuery((q) => ({
      ...q,
      page: 1,
      per_page: perPageDefault,
      search: filterDraft.search.trim() || undefined,
      content_type: filterDraft.content_type || undefined,
      active:
        isAdmin && filterDraft.active === 'active'
          ? true
          : isAdmin && filterDraft.active === 'inactive'
            ? false
            : undefined,
      date_from: isAdmin && filterDraft.date_from ? filterDraft.date_from : undefined,
      date_to: isAdmin && filterDraft.date_to ? filterDraft.date_to : undefined,
      sort_direction: isAdmin ? filterDraft.sort_direction : undefined,
    }));
    setFilterOpen(false);
  }, [filterDraft, isAdmin]);

  const resetFilters = useCallback(() => {
    setPage(ui.loading());
    const perPageDefault = 15;
    setFilterDraft(emptyFilterDraft());
    setListQuery({
      page: 1,
      per_page: perPageDefault,
      search: undefined,
      content_type: undefined,
      active: undefined,
      date_from: undefined,
      date_to: undefined,
      sort_direction: 'desc',
    });
    setFilterOpen(false);
  }, [isAdmin]);

  const goToPage = useCallback((next: number) => {
    setPage(ui.loading());
    setListQuery((q) => ({ ...q, page: next }));
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelectedRow(null);
    setDetail(null);
    setDetailLoading(false);
    setCreatingContentLoading(false);
  }, []);

  const openModal = useCallback(
    (type: 'create' | 'edit' | 'view' | 'delete', row?: ContentRowModel) => {
      if (row) setSelectedRow(row);
      else if (type === 'create') setSelectedRow(null);
      setModal(type);
      if ((type === 'view' || type === 'edit') && row) {
        setDetail(null);
        setDetailLoading(true);
        service
          .getContent(row.id)
          .then((d) => setDetail(d))
          .catch(() => setDetail(null))
          .finally(() => setDetailLoading(false));
      } else {
        setDetail(null);
        setDetailLoading(false);
      }
    },
    [],
  );

  const createContent = useCallback(
    async (payload: CreateContentPayload) => {
      setCreatingContentLoading(true);
      try {
        const dto = await service.createContent(payload);
        setDetail(dto);
        setSelectedRow(mapContentApiDtoToRowModel(dto));
        setDetailLoading(false);
        setModal('view');
        try {
          const res = await service.listContents(isAdmin, listQuery);
          setPage(ui.success(res));
          await refreshUserCharts();
        } catch {
          /* daftar bisa di-refresh manual; jangan tutup modal view */
        }
      } finally {
        setCreatingContentLoading(false);
      }
    },
    [isAdmin, listQuery, refreshUserCharts],
  );

  const updateContent = useCallback(
    async (contentId: string, payload: UpdateContentPayload) => {
      setMutationLoading(true);
      try {
        await service.updateContent(contentId, payload);
        closeModal();
        await loadContents();
      } finally {
        setMutationLoading(false);
      }
    },
    [closeModal, loadContents],
  );

  const deleteContent = useCallback(
    async (contentId: string) => {
      setMutationLoading(true);
      try {
        await service.deleteContent(contentId);
        closeModal();
        await loadContents();
      } finally {
        setMutationLoading(false);
      }
    },
    [closeModal, loadContents],
  );

  return useMemo(
    () => ({
      isAdmin,
      page,
      listQuery,
      filterOpen,
      setFilterOpen,
      filterDraft,
      setFilterDraft,
      openFilterDrawer,
      applyFilters,
      resetFilters,
      goToPage,
      modal,
      selectedRow,
      openModal,
      closeModal,
      detail,
      detailLoading,
      mutationLoading,
      creatingContentLoading,
      createContent,
      updateContent,
      deleteContent,
      userChartStats,
    }),
    [
      isAdmin,
      page,
      listQuery,
      filterOpen,
      filterDraft,
      openFilterDrawer,
      applyFilters,
      resetFilters,
      goToPage,
      modal,
      selectedRow,
      openModal,
      closeModal,
      detail,
      detailLoading,
      mutationLoading,
      creatingContentLoading,
      createContent,
      updateContent,
      deleteContent,
      userChartStats,
    ],
  );
};

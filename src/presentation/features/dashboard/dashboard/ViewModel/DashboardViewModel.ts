import { useEffect, useMemo, useState } from 'react';
import { type UiState, ui } from '../../../../../core/common/UiState';
import type { DashboardModel } from '../Model/DashboardModel';
import { DashboardService } from '../Service/DashboardService';

const service = new DashboardService();

export const useDashboardViewModel = () => {
  const [page, setPage] = useState<UiState<DashboardModel>>(ui.loading());

  useEffect(() => {
    let active = true;
    service
      .getDashboard()
      .then((res) => {
        if (!active) return;
        setPage(ui.success(res));
      })
      .catch(() => {
        if (!active) return;
        setPage(ui.error('Gagal memuat dashboard.'));
      });
    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => ({ page }), [page]);
};

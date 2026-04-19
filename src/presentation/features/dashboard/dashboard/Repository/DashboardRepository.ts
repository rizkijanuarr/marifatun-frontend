import type { DashboardModel } from '../Model/DashboardModel';

export interface DashboardRepository {
  getDashboard(): Promise<DashboardModel>;
}

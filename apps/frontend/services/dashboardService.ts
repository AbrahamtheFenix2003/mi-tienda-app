// apps/frontend/services/dashboardService.ts

import api from './api';
import { DashboardStats, DashboardChartsData } from '@mi-tienda/types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const getDashboardChartsData = async (
  startDate: string,
  endDate: string
): Promise<DashboardChartsData> => {
  const response = await api.get('/dashboard/charts', {
    params: { startDate, endDate },
  });
  return response.data;
};
// apps/frontend/services/dashboardService.ts

import api from './api';
import { DashboardStats } from '@mi-tienda/types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};
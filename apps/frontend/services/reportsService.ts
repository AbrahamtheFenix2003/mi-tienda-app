import api from './api';
import type { SalesReportData } from '@mi-tienda/types';

export const getSalesReport = async (
  from: Date,
  to: Date
): Promise<SalesReportData> => {
  const response = await api.get<SalesReportData>('/reports/sales', {
    params: {
      from: from.toISOString(),
      to: to.toISOString(),
    },
  });

  return response.data;
};

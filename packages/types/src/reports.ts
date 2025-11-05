// packages/types/src/reports.ts

import { Prisma } from '@prisma/client';
import { SaleWithRelations } from './sale.js';

export type SalesReportSummary = {
  totalAmount: Prisma.Decimal;
  totalCost: Prisma.Decimal;
  totalProfit: Prisma.Decimal;
  totalSales: number;
};

export type SalesReportData = {
  summary: SalesReportSummary;
  sales: SaleWithRelations[];
};

export type DailySale = {
  date: string;
  total: number;
};

export type SalesByCategory = {
  category: string;
  total: number;
  count: number;
};

export type SalesByDatePeriod = {
  date: string;
  total: number;
  count: number;
};

export type DashboardStats = {
  totals: {
    totalSales: Prisma.Decimal;
    totalProfit: Prisma.Decimal;
    currentCashBalance: Prisma.Decimal;
    totalProducts: number;
  };
  recentSales: DailySale[]; // Para el gráfico de los últimos 7 días
};

export type DashboardChartsData = {
  salesByDate: SalesByDatePeriod[];
  salesByCategory: SalesByCategory[];
};

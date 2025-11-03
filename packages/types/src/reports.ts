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

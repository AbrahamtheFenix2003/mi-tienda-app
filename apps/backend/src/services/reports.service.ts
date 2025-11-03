// apps/backend/src/services/reports.service.ts

import { Prisma } from '@prisma/client';
import { SalesReportData } from '@mi-tienda/types';
import prisma from '../utils/prisma.js';

export class ReportsService {
  async getSalesReport(from: string, to: string): Promise<SalesReportData> {
    const dateFrom = new Date(from);
    const dateTo = new Date(to);

    if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) {
      throw new Error('Invalid date range provided');
    }

    dateFrom.setHours(0, 0, 0, 0);
    dateTo.setHours(23, 59, 59, 999);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
        status: {
          not: 'ANNULLED',
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        soldBy: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const totalAmount = sales.reduce(
      (sum, sale) => sum.plus(sale.totalAmount),
      new Prisma.Decimal(0)
    );

    const totalCost = sales.reduce(
      (sum, sale) => sum.plus(sale.totalCost ?? 0),
      new Prisma.Decimal(0)
    );

    const totalProfit = totalAmount.minus(totalCost);

    return {
      summary: {
        totalAmount,
        totalCost,
        totalProfit,
        totalSales: sales.length,
      },
      sales,
    };
  }
}

export default ReportsService;

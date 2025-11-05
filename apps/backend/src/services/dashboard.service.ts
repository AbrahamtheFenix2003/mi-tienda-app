import prisma from '../utils/prisma.js';
import { DashboardStats, DailySale, DashboardChartsData, SalesByCategory, SalesByDatePeriod } from '@mi-tienda/types';
import { Prisma } from '@prisma/client';

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    // 1. Calcular Totales de Ventas
    const salesSummary = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
        totalCost: true,
      },
      where: { status: { not: 'ANNULLED' } },
    });

    // 2. Obtener Saldo de Caja Actual
    const lastCashMovement = await prisma.cashMovement.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const currentCashBalance = lastCashMovement ? lastCashMovement.newBalance : new Prisma.Decimal(0);

    // 3. Contar Productos Activos
    const totalProducts = await prisma.product.count({
      where: { isActive: true },
    });

    // 4. Obtener Ventas Recientes (Gráfico de últimos 7 días)
    // Consulta SQL para agrupar ventas por día (últimos 7 días)
    const recentSalesRaw = await prisma.$queryRaw<[{ date: string; total: number }]>`
      SELECT
        TO_CHAR(DATE_TRUNC('day', "createdAt"), 'YYYY-MM-DD') as date,
        SUM("totalAmount") as total
      FROM "Sale"
      WHERE "createdAt" >= (NOW() - INTERVAL '7 days') AND "status" != 'ANNULLED'
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC;
    `;

    // Convertir 'total' de number/Decimal a number si es necesario
    const recentSales: DailySale[] = recentSalesRaw.map(s => ({
      date: s.date,
      total: Number(s.total)
    }));

    // 5. Calcular ganancia total
    const totalSales = salesSummary._sum.totalAmount || new Prisma.Decimal(0);
    const totalCost = salesSummary._sum.totalCost || new Prisma.Decimal(0);
    const totalProfit = totalSales.minus(totalCost);

    // 6. Ensamblar Respuesta
    return {
      totals: {
        totalSales,
        totalProfit,
        currentCashBalance,
        totalProducts,
      },
      recentSales,
    };
  }

  /**
   * Obtiene datos de gráficos (ventas por fecha y por categoría) dentro de un período
   * @param startDate Fecha de inicio (ISO string)
   * @param endDate Fecha de fin (ISO string)
   */
  async getChartsData(startDate: string, endDate: string): Promise<DashboardChartsData> {
    // Crear fechas a las 00:00:00 UTC
    const start = new Date(startDate + 'T00:00:00Z');
    // Crear fecha de fin al último microsegundo del día
    const end = new Date(endDate + 'T23:59:59.999Z');

    console.log('[Dashboard] getChartsData called with:', { startDate, endDate, start, end });

    // 1. Obtener todas las ventas en el período
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        status: { not: 'ANNULLED' },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    console.log('[Dashboard] Found sales:', sales.length);

    // 2. Agrupar por fecha (usando UTC sin conversión de zona horaria)
    const salesByDateMap = new Map<string, { total: number; count: number }>();
    sales.forEach(sale => {
      // Usar la fecha ISO directamente sin conversión de zona horaria
      // La createdAt ya está en UTC, así que solo extraer la fecha
      const date = new Date(sale.createdAt);
      const dateStr = date.getUTCFullYear() + '-' +
                      String(date.getUTCMonth() + 1).padStart(2, '0') + '-' +
                      String(date.getUTCDate()).padStart(2, '0');
      const existing = salesByDateMap.get(dateStr) || { total: 0, count: 0 };
      salesByDateMap.set(dateStr, {
        total: existing.total + Number(sale.totalAmount),
        count: existing.count + 1,
      });
    });

    const salesByDate: SalesByDatePeriod[] = Array.from(salesByDateMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log('[Dashboard] Raw sales dates:', sales.map(s => ({ createdAt: s.createdAt, date: s.createdAt.toISOString() })));
    console.log('[Dashboard] Grouped by date:', salesByDate);

    // 3. Agrupar por categoría
    const salesByCategoryMap = new Map<string, { total: number; count: number }>();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const categoryName = item.product.category?.name || 'Sin categoría';
        const existing = salesByCategoryMap.get(categoryName) || { total: 0, count: 0 };
        salesByCategoryMap.set(categoryName, {
          total: existing.total + Number(item.product.category?.id || 0), // Usar el monto de la venta
          count: existing.count + 1,
        });
      });
    });

    // Recalcular ventas por categoría correctamente
    const salesByCategoryMap2 = new Map<string, { total: number; count: number; saleCount: number }>();
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const categoryName = item.product.category?.name || 'Sin categoría';
        const existing = salesByCategoryMap2.get(categoryName) || { total: 0, count: 0, saleCount: 0 };
        salesByCategoryMap2.set(categoryName, {
          total: existing.total + Number(sale.totalAmount),
          count: existing.count + item.quantity,
          saleCount: existing.saleCount + 1,
        });
      });
    });

    const salesByCategory: SalesByCategory[] = Array.from(salesByCategoryMap2.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.saleCount,
      }))
      .sort((a, b) => b.total - a.total);

    console.log('[Dashboard] Grouped by category:', salesByCategory);

    return {
      salesByDate,
      salesByCategory,
    };
  }
}
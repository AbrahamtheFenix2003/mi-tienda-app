import prisma from '../utils/prisma.js';
import { DashboardStats, DailySale } from '@mi-tienda/types';
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
}
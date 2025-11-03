// apps/frontend/app/(admin)/dashboard/page.tsx

"use client";

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/services/dashboardService';
import { StatCard } from '@/components/admin/dashboard/StatCard';
import { SalesChart } from '@/components/admin/dashboard/SalesChart';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Package,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { QUERY_KEYS } from '@/utils/queryInvalidation';

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_STATS,
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error al cargar los datos del dashboard</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general de tu negocio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Totales"
          value={`S/ ${Number(data.totals.totalSales).toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
        />
        <StatCard
          title="Ganancia Total"
          value={`S/ ${Number(data.totals.totalProfit).toFixed(2)}`}
          icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="Saldo de Caja"
          value={`S/ ${Number(data.totals.currentCashBalance).toFixed(2)}`}
          icon={<Wallet className="h-6 w-6 text-purple-600" />}
        />
        <StatCard
          title="Productos Activos"
          value={data.totals.totalProducts.toString()}
          icon={<Package className="h-6 w-6 text-orange-600" />}
        />
      </div>

      {/* Sales Chart */}
      <SalesChart data={data.recentSales} />
    </div>
  );
}
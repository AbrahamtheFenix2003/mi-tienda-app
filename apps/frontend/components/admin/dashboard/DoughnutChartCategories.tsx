// apps/frontend/components/admin/dashboard/DoughnutChartCategories.tsx

"use client";

import { Card } from '../../ui/Card';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SalesByCategory } from '@mi-tienda/types';

interface DoughnutChartCategoriesProps {
  data: SalesByCategory[];
  isLoading?: boolean;
}

// Colores para las categorías (Tailwind palette)
const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];

export function DoughnutChartCategories({ data, isLoading = false }: DoughnutChartCategoriesProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">Cargando datos del gráfico...</p>
        </div>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribución de Ventas por Categoría
        </h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">No hay datos disponibles para este período</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Distribución de Ventas por Categoría
      </h3>
      <div className="w-full" style={{ height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={2}
              dataKey="total"
              label={(props: any) => {
                const { category, percent } = props as { category: string; percent: number };
                return `${category} ${(percent * 100).toFixed(0)}%`;
              }}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `S/ ${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => `${entry.payload.category}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla resumen debajo del gráfico */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Resumen por Categoría</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, index) => (
            <div key={item.category} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1">
                <p className="text-xs text-gray-600">{item.category}</p>
                <p className="text-sm font-semibold text-gray-900">
                  S/ {item.total.toFixed(2)}
                </p>
              </div>
              <p className="text-xs text-gray-500">{item.count} venta(s)</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

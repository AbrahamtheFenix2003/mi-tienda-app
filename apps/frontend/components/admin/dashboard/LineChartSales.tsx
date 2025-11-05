// apps/frontend/components/admin/dashboard/LineChartSales.tsx

"use client";

import { Card } from '../../ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SalesByDatePeriod } from '@mi-tienda/types';

interface LineChartSalesProps {
  data: SalesByDatePeriod[];
  isLoading?: boolean;
}

export function LineChartSales({ data, isLoading = false }: LineChartSalesProps) {
  // Formatear datos para mostrar fechas de forma legible
  // item.date viene en formato YYYY-MM-DD en UTC
  const formatData = data.map(item => {
    // Crear un Date a partir de la fecha ISO y formatearlo en UTC
    const date = new Date(item.date + 'T00:00:00Z');

    return {
      ...item,
      dateFormatted: date.toLocaleDateString('es-PE', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'short'
      })
    };
  });

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
          Evolución de Ventas
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
        Evolución de Ventas
      </h3>
      <div className="w-full" style={{ height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dateFormatted"
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `S/ ${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Total de Ventas']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#3b82f6"
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              strokeWidth={2}
              name="Total de Ventas"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

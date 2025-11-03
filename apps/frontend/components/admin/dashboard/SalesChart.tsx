// apps/frontend/components/admin/dashboard/SalesChart.tsx

"use client";

import { Card } from '../../ui/Card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { DailySale } from '@mi-tienda/types';

interface SalesChartProps {
  data: DailySale[];
}

export function SalesChart({ data }: SalesChartProps) {
  // Formatear fecha para mostrarla de forma más legible
  const formatData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short'
    })
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Ventas de los últimos 7 días
      </h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formatData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => `S/ ${value}`}
            />
            <Tooltip 
              formatter={(value: number) => [`S/ ${value.toFixed(2)}`, 'Ventas']}
            />
            <Bar 
              dataKey="total" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
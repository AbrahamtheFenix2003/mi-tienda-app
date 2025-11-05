// apps/frontend/components/admin/dashboard/DateRangeSelector.tsx

"use client";

import { useState } from 'react';
import { Card } from '../../ui/Card';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export function DateRangeSelector({ onDateRangeChange, isLoading = false }: DateRangeSelectorProps) {
  // Inicializar con los últimos 30 días
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

  const handleApply = () => {
    onDateRangeChange(startDate, endDate);
  };

  // Funciones para presets rápidos
  const handleLast7Days = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newStart = start.toISOString().split('T')[0];
    const newEnd = end.toISOString().split('T')[0];
    setStartDate(newStart);
    setEndDate(newEnd);
    onDateRangeChange(newStart, newEnd);
  };

  const handleLast30Days = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newStart = start.toISOString().split('T')[0];
    const newEnd = end.toISOString().split('T')[0];
    setStartDate(newStart);
    setEndDate(newEnd);
    onDateRangeChange(newStart, newEnd);
  };

  const handleLast90Days = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
    const newStart = start.toISOString().split('T')[0];
    const newEnd = end.toISOString().split('T')[0];
    setStartDate(newStart);
    setEndDate(newEnd);
    onDateRangeChange(newStart, newEnd);
  };

  const handleThisMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const newStart = firstDay.toISOString().split('T')[0];
    const newEnd = today.toISOString().split('T')[0];
    setStartDate(newStart);
    setEndDate(newEnd);
    onDateRangeChange(newStart, newEnd);
  };

  const handleLastMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
    const newStart = firstDay.toISOString().split('T')[0];
    const newEnd = lastDay.toISOString().split('T')[0];
    setStartDate(newStart);
    setEndDate(newEnd);
    onDateRangeChange(newStart, newEnd);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Selector de Período
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Fin
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleApply}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Cargando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      {/* Presets rápidos */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Presets rápidos:</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <button
            onClick={handleLast7Days}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Últimos 7 días
          </button>
          <button
            onClick={handleLast30Days}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Últimos 30 días
          </button>
          <button
            onClick={handleLast90Days}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Últimos 90 días
          </button>
          <button
            onClick={handleThisMonth}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Este mes
          </button>
          <button
            onClick={handleLastMonth}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Mes pasado
          </button>
        </div>
      </div>
    </Card>
  );
}

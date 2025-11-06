"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, PlusCircle, TrendingUp, TrendingDown } from "lucide-react";
import type { CashMovementWithRelations } from "@mi-tienda/types";
import { getCashMovements, deleteManualMovement } from "@/services/cashService";
import CashMovementsTable from "@/components/admin/CashMovementsTable";
import { ManualMovementModal } from "@/components/admin/ManualMovementModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function CajaPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementToEdit, setMovementToEdit] = useState<CashMovementWithRelations | null>(null);
  const [filterType, setFilterType] = useState<'TODOS' | 'ENTRADA' | 'SALIDA'>('TODOS');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cashMovements"],
    queryFn: getCashMovements,
  });

  // Mutación para eliminar movimiento
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteManualMovement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashMovements"] });
    },
    onError: (error) => {
      console.error('Error deleting movement:', error);
      alert('Error al eliminar el movimiento. Intente nuevamente.');
    },
  });

  // Filtrar movimientos por tipo y rango de fechas
  const filteredData = React.useMemo(() => {
    if (!data) return [];

    return data.filter((movement) => {
      // Filtro por tipo
      if (filterType !== 'TODOS' && movement.type !== filterType) {
        return false;
      }

      // Filtro por rango de fechas
      if (dateFrom || dateTo) {
        const movementDate = new Date(movement.date || movement.createdAt);

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setUTCHours(0, 0, 0, 0);
          if (movementDate < fromDate) return false;
        }

        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setUTCHours(23, 59, 59, 999);
          if (movementDate > toDate) return false;
        }
      }

      return true;
    });
  }, [data, filterType, dateFrom, dateTo]);

  // Lógica de Saldo: data ya está ordenado por fecha descendente desde el backend
  const currentBalance = data && data.length > 0
    ? data[0].newBalance
    : 0;

  // Calcular totales de ingresos y egresos en datos filtrados
  const totals = React.useMemo(() => {
    const ingresos = filteredData
      .filter((mov) => mov.type === 'ENTRADA')
      .reduce((sum, mov) => sum + Number(mov.amount), 0);

    const egresos = filteredData
      .filter((mov) => mov.type === 'SALIDA')
      .reduce((sum, mov) => sum + Number(mov.amount), 0);

    return { ingresos, egresos };
  }, [filteredData]);

  const handleEdit = (movement: CashMovementWithRelations) => {
    setMovementToEdit(movement);
    setIsModalOpen(true);
  };

  const handleDelete = (movementId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este movimiento? Esta acción no se puede deshacer.')) {
      deleteMutation.mutate(movementId);
    }
  };

  const handleNewMovement = () => {
    setMovementToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Saldo Actual */}
      <Card className="mb-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Saldo Actual en Caja</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-blue-900">
            {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(currentBalance))}
          </p>
        </CardContent>
      </Card>

      {/* Tarjetas de Totales de Ingresos y Egresos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tarjeta de Ingresos */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-900">Total de Ingresos</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900">
              {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(totals.ingresos)}
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta de Egresos */}
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-900">Total de Egresos</CardTitle>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-900">
              {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(totals.egresos)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Encabezado de la página */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Movimientos de Caja</h1>
        </div>
        <button
          type="button"
          onClick={handleNewMovement}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle size={16} className="mr-2" />
          Nuevo Movimiento
        </button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de Tipo */}
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Movimiento
              </label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'TODOS' | 'ENTRADA' | 'SALIDA')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos</option>
                <option value="ENTRADA">Ingresos</option>
                <option value="SALIDA">Egresos</option>
              </select>
            </div>

            {/* Filtro Fecha Desde */}
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro Fecha Hasta */}
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botón para limpiar filtros */}
          {(filterType !== 'TODOS' || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setFilterType('TODOS');
                setDateFrom('');
                setDateTo('');
              }}
              className="mt-4 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Limpiar Filtros
            </button>
          )}
        </CardContent>
      </Card>

      {isLoading && <p>Cargando...</p>}

      {isError && (
        <div className="text-red-600">
          Error cargando movimientos de caja. Intente recargar la página.
        </div>
      )}

      {data && <CashMovementsTable data={filteredData} onEdit={handleEdit} onDelete={handleDelete} />}

      {/* Modal para crear/editar movimientos manuales */}
      <ManualMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movementToEdit={movementToEdit}
      />
    </div>
  );
}
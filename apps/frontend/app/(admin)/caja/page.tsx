"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, PlusCircle } from "lucide-react";
import type { CashMovementWithRelations } from "@mi-tienda/types";
import { getCashMovements } from "@/services/cashService";
import CashMovementsTable from "@/components/admin/CashMovementsTable";
import { ManualMovementModal } from "@/components/admin/ManualMovementModal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function CajaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [movementToEdit, setMovementToEdit] = useState<CashMovementWithRelations | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cashMovements"],
    queryFn: getCashMovements,
  });

  // Lógica de Saldo: data ya está ordenado por fecha descendente desde el backend
  const currentBalance = data && data.length > 0
    ? data[0].newBalance
    : 0;

  const handleEdit = (movement: CashMovementWithRelations) => {
    setMovementToEdit(movement);
    setIsModalOpen(true);
  };

  const handleNewMovement = () => {
    setMovementToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Saldo Actual */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Saldo Actual en Caja</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(currentBalance))}
          </p>
        </CardContent>
      </Card>

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

      {isLoading && <p>Cargando...</p>}

      {isError && (
        <div className="text-red-600">
          Error cargando movimientos de caja. Intente recargar la página.
        </div>
      )}

      {data && <CashMovementsTable data={data} onEdit={handleEdit} />}

      {/* Modal para crear/editar movimientos manuales */}
      <ManualMovementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movementToEdit={movementToEdit}
      />
    </div>
  );
}
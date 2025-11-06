"use client";

import React from "react";
import type { CashMovementWithRelations } from "@mi-tienda/types";
import { ArrowUpCircle, ArrowDownCircle, Pencil, Trash2 } from "lucide-react";

interface CashMovementsTableProps {
  data: CashMovementWithRelations[];
  onEdit?: (movement: CashMovementWithRelations) => void;
  onDelete?: (movementId: string) => void;
}

export default function CashMovementsTable({ data, onEdit, onDelete }: CashMovementsTableProps) {
  // Función para formatear fechas (manejo correcto de zona horaria UTC)
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Categoría</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Descripción</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Monto</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Saldo Anterior</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Nuevo Saldo</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Método pago</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Usuario</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((mov) => {
            const dateString = String(mov.date || mov.createdAt);
            const date = formatDate(dateString);
            const isIncome = ["IN", "ENTRADA", "INGRESO"].includes((mov.type || "").toUpperCase());
            const amountNum = Number(mov.amount ?? 0);
            const amountFormatted = `S/ ${amountNum.toFixed(2)}`;

            return (
              <tr key={mov.id}>
                <td className="px-4 py-3 text-sm text-gray-700">{date}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    {isIncome ? (
                      <ArrowUpCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="uppercase text-sm">{mov.type ?? "-"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{mov.category ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{mov.description ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">{amountFormatted}</td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right">
                  {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(mov.previousBalance))}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">
                  {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(mov.newBalance))}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{mov.paymentMethod ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{mov.user?.name ?? mov.user?.email ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {mov.referenceId === null ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => onEdit?.(mov)}
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => onDelete?.(mov.id)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">Auto</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
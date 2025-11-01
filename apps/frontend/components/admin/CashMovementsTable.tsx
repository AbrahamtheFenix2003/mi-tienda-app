"use client";

import React from "react";
import type { CashMovementWithRelations } from "@mi-tienda/types";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface CashMovementsTableProps {
  data: CashMovementWithRelations[];
}

export default function CashMovementsTable({ data }: CashMovementsTableProps) {
  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Descripción</th>
            <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Monto</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Método pago</th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Usuario</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((mov) => {
            const date =
              (mov.createdAt && new Date(mov.createdAt).toLocaleString()) ||
              (mov.date && new Date(mov.date).toLocaleString()) ||
              "";
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
                <td className="px-4 py-3 text-sm text-gray-700">{mov.description ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">{amountFormatted}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{mov.paymentMethod ?? "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{mov.user?.name ?? mov.user?.email ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
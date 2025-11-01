"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getCashMovements } from "@/services/cashService";
import CashMovementsTable from "@/components/admin/CashMovementsTable";

export default function CajaPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["cashMovements"],
    queryFn: getCashMovements,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Movimientos de Caja</h1>

      {isLoading && <p>Cargando...</p>}

      {isError && (
        <div className="text-red-600">
          Error cargando movimientos de caja. Intente recargar la página.
        </div>
      )}

      {data && <CashMovementsTable data={data} />}
    </div>
  );
}
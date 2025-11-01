'use client';

import React from 'react';
import { StockLot, LotStatus } from '@mi-tienda/types';

interface StockLotsTableProps {
  lots: StockLot[];
}

// Helper para formatear precios
const formatPrice = (price: string): string => {
  const numericPrice = parseFloat(price);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(numericPrice);
};

// Helper para formatear fechas
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Componente para mostrar el estado con badge
const StatusBadge: React.FC<{ status: LotStatus }> = ({ status }) => {
  const getStatusConfig = (status: LotStatus) => {
    switch (status) {
      case "ACTIVO":
        return { text: 'Activo', color: 'bg-green-100 text-green-800' };
      case "AGOTADO":
        return { text: 'Agotado', color: 'bg-gray-100 text-gray-800' };
      case "ELIMINADO":
        return { text: 'Eliminado', color: 'bg-red-100 text-red-800' };
      case "VENCIDO":
        return { text: 'Vencido', color: 'bg-orange-100 text-orange-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

export const StockLotsTable: React.FC<StockLotsTableProps> = ({ lots }) => {
  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lote ID
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Proveedor
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock Lote
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Costo Unit.
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Entrada
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {lots.map((lot) => (
            <tr key={lot.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{lot.product?.name || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{lot.loteId}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{lot.supplier?.name || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {lot.quantity} / {lot.originalQuantity}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatPrice(lot.costPerUnit)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatDate(lot.entryDate)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={lot.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
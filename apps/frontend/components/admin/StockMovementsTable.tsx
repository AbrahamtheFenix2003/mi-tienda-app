'use client';

import React from 'react';
import { StockMovement, StockMovementType, StockMovementSubType } from '@mi-tienda/types';

interface StockMovementsTableProps {
  movements: StockMovement[];
}

// Helper para formatear precios
const formatPrice = (price: string | null | undefined): string => {
  if (!price) return 'N/A';
  const num = parseFloat(price);
  return isNaN(num) 
    ? 'N/A' 
    : new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
};

// Helper para formatear fecha y hora
const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.toLocaleDateString('es-PE')} ${date.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const StockMovementsTable: React.FC<StockMovementsTableProps> = ({ movements }) => {
  return (
    <div className="overflow-x-auto shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha y Hora
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sub-Tipo
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cantidad
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Costo Total
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {movements.map((movement) => (
            <tr key={movement.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDateTime(movement.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {movement.product?.name || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  movement.type === 'ENTRADA' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {movement.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {movement.subType || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={
                  movement.quantity > 0 
                    ? 'text-green-600' 
                    : movement.quantity < 0 
                      ? 'text-red-600' 
                      : ''
                }>
                  {movement.quantity}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPrice(movement.totalCost)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {movement.user?.name || 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StockMovementsTable;
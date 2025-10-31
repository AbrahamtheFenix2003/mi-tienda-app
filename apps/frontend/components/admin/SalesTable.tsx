'use client';

import React from 'react';
import { Sale } from '@mi-tienda/types';
import { Eye, FileX } from 'lucide-react';

interface SalesTableProps {
  sales: Sale[];
  onViewDetails: (sale: Sale) => void;
  onAnnul: (sale: Sale) => void;
}

/**
 * Componente de tabla para mostrar las ventas registradas
 */
export const SalesTable = ({ sales, onViewDetails, onAnnul }: SalesTableProps) => {
  
  // Función para formatear precios
  const formatPrice = (price: string): string => {
    return `S/ ${parseFloat(price).toFixed(2)}`;
  };

  // Función para formatear fechas (manejo correcto de zona horaria UTC)
  const formatDate = (dateString: string): string => {
    // Las fechas se almacenan en UTC, así que usamos la zona horaria UTC para el formateo
    return new Date(dateString).toLocaleDateString('es-PE', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Función para obtener el color del badge según el estado de la venta
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'ANNULLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para formatear el texto del estado
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'PAID':
        return 'Pagada';
      case 'PENDING':
        return 'Pendiente';
      case 'SHIPPED':
        return 'Enviada';
      case 'DELIVERED':
        return 'Entregada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'ANNULLED':
        return 'Anulada';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto Total
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ganancia
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendedor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                
                {/* Fecha */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(sale.createdAt)}
                  </div>
                </td>

                {/* Cliente */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sale.customerName}
                  </div>
                  {sale.customerPhone && (
                    <div className="text-sm text-gray-500">
                      {sale.customerPhone}
                    </div>
                  )}
                </td>

                {/* Monto Total */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(sale.totalAmount)}
                  </div>
                </td>

                {/* Ganancia */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sale.profit ? formatPrice(sale.profit) : 'N/A'}
                  </div>
                </td>

                {/* Vendedor */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {sale.soldBy?.name || 'N/A'}
                  </div>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(sale.status)}`}>
                    {getStatusText(sale.status)}
                  </span>
                </td>
                
                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => onViewDetails(sale)}
                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors"
                    title="Ver Detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAnnul(sale)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors"
                    title="Anular Venta"
                  >
                    <FileX className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
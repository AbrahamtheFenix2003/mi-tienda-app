// components/admin/PurchaseTable.tsx

'use client';

import React from 'react';
import { Purchase } from '@mi-tienda/types';
import { Eye, FileX } from 'lucide-react';

interface PurchaseTableProps {
  purchases: Purchase[];
  onViewDetails: (purchase: Purchase) => void;
  onAnnul: (purchase: Purchase) => void;
}

/**
 * Componente de tabla para mostrar las compras registradas
 */
export const PurchaseTable = ({ purchases, onViewDetails, onAnnul }: PurchaseTableProps) => {
  
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

  // Función para obtener el color del badge según el estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RECIBIDA_COMPLETA':
        return 'bg-green-100 text-green-800';
      case 'RECIBIDA_PARCIAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'REGISTRADA':
        return 'bg-blue-100 text-blue-800';
      case 'ANULADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para formatear el texto del estado
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'RECIBIDA_COMPLETA':
        return 'Completa';
      case 'RECIBIDA_PARCIAL':
        return 'Parcial';
      case 'REGISTRADA':
        return 'Registrada';
      case 'ANULADA':
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
                Proveedor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Factura / Doc
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto Total
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
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                
                {/* Fecha */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(purchase.purchaseDate)}
                  </div>
                </td>

                {/* Proveedor */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {purchase.supplier?.name || 'N/A'}
                  </div>
                </td>

                {/* Número de Factura/Documento */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {purchase.invoiceNumber || 'N/A'}
                  </div>
                </td>

                {/* Monto Total */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(purchase.totalAmount)}
                  </div>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(purchase.status)}`}>
                    {getStatusText(purchase.status)}
                  </span>
                </td>
                
                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => onViewDetails(purchase)}
                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors"
                    title="Ver Detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAnnul(purchase)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors"
                    title="Anular Compra"
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
// components/admin/PurchaseDetailsModal.tsx

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Purchase } from '@mi-tienda/types';

interface PurchaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

export const PurchaseDetailsModal: React.FC<PurchaseDetailsModalProps> = ({
  isOpen,
  onClose,
  purchase,
}) => {
  // Función para formatear precios
  const formatPrice = (price: string): string => {
    return `S/ ${parseFloat(price).toFixed(2)}`;
  };

  // Función para formatear fechas
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('es-PE', {
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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl" 
      title={purchase ? `Detalles de Compra: ${purchase.invoiceNumber || purchase.id.slice(-6)}` : 'Detalles de Compra'}
    >
      {!purchase ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Cargando...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sección 1: Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <strong>Proveedor:</strong> {purchase.supplier?.name || 'N/A'}
            </div>
            <div>
              <strong>Fecha:</strong> {formatDate(purchase.purchaseDate)}
            </div>
            <div>
              <strong>Factura:</strong> {purchase.invoiceNumber || 'N/A'}
            </div>
            <div>
              <strong>Pago:</strong> {purchase.paymentMethod || 'N/A'}
            </div>
            <div>
              <strong>Estado:</strong> 
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${getStatusBadge(purchase.status)}`}>
                {getStatusText(purchase.status)}
              </span>
            </div>
          </div>

          {/* Sección 2: Listado de Items */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Productos</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Costo Unitario
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchase.items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.product?.name || 'Producto no encontrado'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.quantity}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatPrice(item.purchasePrice)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice((parseFloat(item.purchasePrice) * item.quantity).toString())}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sección 3: Total */}
          <div className="text-right text-xl font-bold mt-4 pt-4 border-t border-gray-200">
            Total: {formatPrice(purchase.totalAmount)}
          </div>

          {/* Sección 4: Botón Cerrar */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PurchaseDetailsModal;
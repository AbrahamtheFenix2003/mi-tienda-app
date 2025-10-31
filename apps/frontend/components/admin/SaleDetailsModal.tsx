'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Sale } from '@mi-tienda/types';

interface SaleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const formatPrice = (price: string | null | undefined): string => {
  if (!price) return 'N/A';
  
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return 'N/A';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({
  isOpen,
  onClose,
  sale,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        sale
          ? `Detalles de Venta: ${sale.customerName}`
          : 'Detalles de Venta'
      }
    >
      {!sale ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sección 1: Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <strong>Cliente:</strong> {sale.customerName}
            </div>
            <div>
              <strong>Fecha:</strong> {formatDate(sale.createdAt)}
            </div>
            <div>
              <strong>Vendedor:</strong> {sale.soldBy?.name || 'N/A'}
            </div>
            <div>
              <strong>Pago:</strong> {sale.paymentMethod}
            </div>
            <div>
              <strong>Entrega:</strong> {sale.deliveryMethod}
            </div>
            <div>
              <strong>Estado:</strong>{' '}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(sale.status)}`}>
                {sale.status}
              </span>
            </div>
          </div>

          {/* Sección 2: Listado de Items */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio Unitario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sale.items.map((item) => {
                  const subtotal = parseFloat(item.price) * item.quantity;
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.product?.name || 'Producto no encontrado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatPrice(subtotal.toString())}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sección 3: Resumen Financiero */}
          <div className="text-right space-y-2 mt-4">
            <div>
              Subtotal: {formatPrice(sale.subtotalAmount)}
            </div>
            <div>
              Envío: {formatPrice(sale.deliveryCost)}
            </div>
            <div className="text-xl font-bold">
              Total: {formatPrice(sale.totalAmount)}
            </div>
            <div className="text-lg text-green-600 font-semibold">
              Ganancia: {formatPrice(sale.profit)}
            </div>
          </div>

          {/* Sección 4: Botón Cerrar */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
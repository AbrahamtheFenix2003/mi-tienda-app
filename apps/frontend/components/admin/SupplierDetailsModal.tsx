'use client';

import React, { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Supplier, Purchase } from '@mi-tienda/types';
import { X, Building2, AlertCircle, Phone, Mail, MapPin, User } from 'lucide-react';

interface SupplierDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  purchases: Purchase[];
  isLoading?: boolean;
}

export const SupplierDetailsModal = ({
  isOpen,
  onClose,
  supplier,
  purchases,
  isLoading = false,
}: SupplierDetailsModalProps) => {
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return `S/ ${isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatOptionalField = (value: string | null | undefined) => {
    return value && value.trim() !== '' ? value : 'N/A';
  };

  // Calcular estadísticas de compras
  const purchaseStats = useMemo(() => {
    const totalAmount = purchases.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0);
    const totalItems = purchases.reduce((sum, p) => sum + p.items.length, 0);
    return { totalAmount, totalItems };
  }, [purchases]);

  if (!supplier) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={supplier.name} size="xl">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Información General del Proveedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
            {/* Datos de Contacto */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Nombre</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">{supplier.name}</p>
              </div>

              {supplier.contact && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    <User className="h-3 w-3" /> Contacto
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{supplier.contact}</p>
                </div>
              )}

              {supplier.phone && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Teléfono
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{supplier.phone}</p>
                </div>
              )}
            </div>

            {/* Información Adicional */}
            <div className="space-y-4">
              {supplier.email && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{supplier.email}</p>
                </div>
              )}

              {supplier.address && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Dirección
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{supplier.address}</p>
                </div>
              )}

              {/* Estado */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Estado</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full ${
                      supplier.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {supplier.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas de Compras */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase">Total Compras</label>
              <p className="text-lg font-bold text-blue-600 mt-1">{purchases.length}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase">Total Artículos</label>
              <p className="text-lg font-bold text-purple-600 mt-1">{purchaseStats.totalItems}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase">Monto Total</label>
              <p className="text-lg font-bold text-green-600 mt-1">{formatPrice(purchaseStats.totalAmount.toString())}</p>
            </div>
          </div>

          {/* Compras Asociadas */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Compras Asociadas</h3>

            {purchases.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center border border-dashed border-gray-300">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No hay compras asociadas a este proveedor</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Factura</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Productos</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Monto</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchases.map((purchase) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'REGISTRADA':
                            return 'bg-yellow-100 text-yellow-800';
                          case 'RECIBIDA_PARCIAL':
                            return 'bg-orange-100 text-orange-800';
                          case 'RECIBIDA_COMPLETA':
                            return 'bg-green-100 text-green-800';
                          case 'ANULADA':
                            return 'bg-red-100 text-red-800';
                          default:
                            return 'bg-gray-100 text-gray-800';
                        }
                      };

                      const statusLabel = {
                        REGISTRADA: 'Registrada',
                        RECIBIDA_PARCIAL: 'Parcial',
                        RECIBIDA_COMPLETA: 'Completa',
                        ANULADA: 'Anulada',
                      }[purchase.status] || purchase.status;

                      return (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-mono text-xs">
                            {purchase.invoiceNumber || `Compra ${purchase.id.slice(0, 8)}`}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700">
                            {formatDate(purchase.purchaseDate)}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-900">
                            {purchase.items.length}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {formatPrice(purchase.totalAmount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex text-xs font-semibold px-2 py-1 rounded ${getStatusColor(purchase.status)}`}>
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SupplierDetailsModal;

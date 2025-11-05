'use client';

import React, { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Product, StockLot } from '@mi-tienda/types';
import { X, Package, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { getAbsoluteImageUrl, isLocalUrl } from '@/lib/imageUtils';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  stockLots: StockLot[];
  isLoading?: boolean;
}

export const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  stockLots,
  isLoading = false,
}: ProductDetailsModalProps) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO':
        return 'bg-green-100 text-green-800';
      case 'AGOTADO':
        return 'bg-red-100 text-red-800';
      case 'VENCIDO':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const activeLots = useMemo(() => {
    return stockLots.filter((lot) => lot.status === 'ACTIVO');
  }, [stockLots]);

  const totalActiveCost = useMemo(() => {
    return activeLots.reduce((total, lot) => {
      const cost = parseFloat(lot.costPerUnit) * lot.quantity;
      return total + (isNaN(cost) ? 0 : cost);
    }, 0);
  }, [activeLots]);

  if (!product) return null;

  const imageUrl = getAbsoluteImageUrl(product.imageUrl);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="xl">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
            {/* Imagen */}
            <div className="flex flex-col items-center">
              {imageUrl ? (
                <div className="h-48 w-48 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                  {isLocalUrl(imageUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="object-cover h-48 w-48 rounded-lg"
                    />
                  ) : (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      width={192}
                      height={192}
                      className="object-cover rounded-lg"
                    />
                  )}
                </div>
              ) : (
                <div className="h-48 w-48 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Detalles Básicos */}
            <div className="space-y-4">
              {/* SKU */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">SKU</label>
                <p className="text-sm font-mono text-gray-900">{product.code}</p>
              </div>

              {/* Slug */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Slug</label>
                <p className="text-sm text-gray-900">{product.slug}</p>
              </div>

              {/* Categoría */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Categoría</label>
                <p className="text-sm text-gray-900">
                  {product.category?.name || 'Sin categoría'}
                </p>
              </div>

              {/* Stock */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Stock Total</label>
                <p className="text-sm font-semibold text-gray-900">{product.stock} unidades</p>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-rose-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase">Precio de Venta</label>
              <p className="text-lg font-bold text-rose-600 mt-1">{formatPrice(product.price)}</p>
            </div>

            {product.originalPrice && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <label className="text-xs font-semibold text-gray-500 uppercase">Precio Original</label>
                <p className="text-lg font-bold text-blue-600 mt-1">{formatPrice(product.originalPrice)}</p>
              </div>
            )}

            {product.acquisitionCost && (
              <div className="bg-green-50 p-4 rounded-lg">
                <label className="text-xs font-semibold text-gray-500 uppercase">Costo de Adquisición</label>
                <p className="text-lg font-bold text-green-600 mt-1">{formatPrice(product.acquisitionCost)}</p>
              </div>
            )}
          </div>

          {/* Descripción */}
          {product.description && (
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Descripción</label>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{product.description}</p>
            </div>
          )}

          {/* Lotes de Inventario */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-bold text-gray-900">Lotes de Inventario</h3>
              <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded">
                {activeLots.length} activo{activeLots.length !== 1 ? 's' : ''}
              </span>
            </div>

            {activeLots.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center border border-dashed border-gray-300">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No hay lotes de inventario activos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">ID Lote</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Cantidad</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo Unitario</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo Total</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha Entrada</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Vencimiento</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {activeLots.map((lot) => {
                      const costPerUnit = parseFloat(lot.costPerUnit);
                      const totalCost = costPerUnit * lot.quantity;

                      return (
                        <tr key={lot.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-mono text-xs">{lot.loteId}</td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-900">
                            {lot.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            S/ {costPerUnit.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            S/ {totalCost.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {formatDate(lot.entryDate)}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {lot.expiryDate ? formatDate(lot.expiryDate) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex text-xs font-semibold px-2 py-1 rounded ${getStatusColor(lot.status)}`}>
                              {lot.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Resumen de Costos */}
            {activeLots.length > 0 && (
              <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-900">Costo Total de Lotes Activos:</label>
                  <span className="text-lg font-bold text-amber-700">
                    S/ {totalActiveCost.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Otros Lotes */}
          {stockLots.length > activeLots.length && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Otros Lotes</h3>
              <div className="grid grid-cols-1 gap-2">
                {stockLots
                  .filter((lot) => lot.status !== 'ACTIVO')
                  .map((lot) => (
                    <div key={lot.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div>
                        <p className="text-xs font-mono text-gray-700">{lot.loteId}</p>
                        <p className="text-sm text-gray-600">{lot.quantity} unidades</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(lot.status)}`}>
                        {lot.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ProductDetailsModal;

'use client';

import React, { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Category, Product } from '@mi-tienda/types';
import { AlertCircle, FolderOpen, Box } from 'lucide-react';

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  products: Product[];
  isLoading?: boolean;
}

export const CategoryDetailsModal = ({
  isOpen,
  onClose,
  category,
  products,
  isLoading = false,
}: CategoryDetailsModalProps) => {
  const formatPrice = (price: string | null | undefined) => {
    if (!price) return 'S/ 0.00';
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

  // Calcular estadísticas de productos
  const productStats = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => {
      const price = parseFloat(p.price || '0');
      return sum + price * p.stock;
    }, 0);
    const avgPrice = products.length > 0
      ? products.reduce((sum, p) => sum + parseFloat(p.price || '0'), 0) / products.length
      : 0;

    return { totalStock, totalValue, avgPrice };
  }, [products]);

  if (!category) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category.name} size="xl">
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Información General de la Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Nombre de Categoría</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">{category.name}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Fecha de Creación</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(category.createdAt)}</p>
            </div>
          </div>

          {/* Estadísticas de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase">Total Productos</label>
              <p className="text-lg font-bold text-blue-600 mt-1">{products.length}</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase">Stock Total</label>
              <p className="text-lg font-bold text-purple-600 mt-1">{productStats.totalStock} unidades</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <label className="text-xs font-semibold text-gray-500 uppercase">Valor Total</label>
              <p className="text-lg font-bold text-green-600 mt-1">{formatPrice(productStats.totalValue.toString())}</p>
            </div>
          </div>

          {/* Productos Asociados */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Productos Asociados</h3>

            {products.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center border border-dashed border-gray-300">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No hay productos en esta categoría</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm divide-y divide-gray-200 border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">SKU</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Precio</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Stock</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => {
                      const productValue = parseFloat(product.price || '0') * product.stock;
                      const isActive = product.isActive;
                      const isLowStock = product.stock <= 10;

                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            <div className="flex items-center gap-2">
                              <Box className="h-4 w-4 text-gray-400" />
                              {product.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-700 font-mono text-xs">
                            {product.code || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex text-xs font-semibold px-2 py-1 rounded ${
                              isLowStock
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {formatPrice(productValue.toString())}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex text-xs font-semibold px-2 py-1 rounded ${
                              isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isActive ? 'Activo' : 'Inactivo'}
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

          {/* Resumen de Información */}
          {products.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Resumen de Categoría</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Precio Promedio:</span>
                  <p className="font-semibold text-gray-900">{formatPrice(productStats.avgPrice.toString())}</p>
                </div>
                <div>
                  <span className="text-gray-600">Productos Activos:</span>
                  <p className="font-semibold text-gray-900">{products.filter(p => p.isActive).length}</p>
                </div>
                <div>
                  <span className="text-gray-600">Stock Bajo:</span>
                  <p className="font-semibold text-gray-900">{products.filter(p => p.stock <= 10).length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CategoryDetailsModal;

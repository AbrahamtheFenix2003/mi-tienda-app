// components/admin/ProductTable.tsx

'use client';

import { Product } from '@mi-tienda/types';
import { Edit, Trash2, Package, Eye } from 'lucide-react';
import Image from 'next/image';
import { getAbsoluteImageUrl, isLocalUrl } from '@/lib/imageUtils';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onView?: (product: Product) => void;
}

/**
 * Componente de UI "tonto" (dumb component).
 * Muestra una lista de productos en una tabla.
 */
export const ProductTable = ({ products, onEdit, onDelete, onView }: ProductTableProps) => {
  
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return `S/ ${isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)}`;
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagen
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const stock = product.stock || 0;

              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  
                  {/* Imagen */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="shrink-0 h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        (() => {
                          const absoluteUrl = getAbsoluteImageUrl(product.imageUrl) || '/placeholder.png';
                          // Usar <img> para URLs locales (localhost), <Image /> para producción
                          return isLocalUrl(absoluteUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={absoluteUrl}
                              alt={product.name}
                              className="object-cover h-12 w-12 rounded-md"
                            />
                          ) : (
                            <Image
                              src={absoluteUrl}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="object-cover rounded-md"
                            />
                          );
                        })()
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </td>

                  {/* Nombre y SKU */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate" style={{ maxWidth: '250px' }}>
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {product.code}
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.category ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>

                  {/* Precio */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                    {formatPrice(product.price)}
                  </td>

                  {/* Stock */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {stock}
                    </span>
                  </td>
                  
                  {/* Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(product)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        title="Ver Detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors"
                      title="Editar Producto"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors"
                      title="Eliminar Producto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

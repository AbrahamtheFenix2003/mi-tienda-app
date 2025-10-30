// components/admin/ShoppingCart.tsx

'use client';

import React from 'react';
import { ShoppingCart as CartIcon, Trash2 } from 'lucide-react';

interface CartItem {
  productId: number;
  productName: string;
  productCode?: string | null;
  quantity: number;
  purchasePrice: number;
  subtotal: number;
}

interface ShoppingCartProps {
  items: CartItem[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onRemoveItem,
  onUpdateQuantity,
}) => {
  // Calcular total de la compra
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="bg-white shadow border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          <CartIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Cesta de Compras
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <CartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              No hay productos agregados a la cesta
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Agrega productos para comenzar tu compra
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="p-4">
                <div className="flex items-start justify-between">
                  {/* Información del producto */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.productName}
                    </h4>
                    {item.productCode && (
                      <p className="text-xs text-gray-500 mt-1">
                        Código: {item.productCode}
                      </p>
                    )}
                    
                    {/* Cantidad y precio */}
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-gray-600">Cant:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 1;
                            onUpdateQuantity(index, Math.max(1, newQuantity));
                          }}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        S/ {item.purchasePrice.toFixed(2)} c/u
                      </div>
                    </div>
                  </div>

                  {/* Subtotal y eliminar */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        S/ {item.subtotal.toFixed(2)}
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => onRemoveItem(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer con total */}
      {items.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Total de la Compra:
            </span>
            <span className="text-lg font-bold text-green-600">
              S/ {totalAmount.toFixed(2)}
            </span>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {items.length} producto{items.length !== 1 ? 's' : ''} • Cantidad total: {items.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
'use client';

import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import { getAbsoluteImageUrl, isLocalUrl } from '@/lib/imageUtils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToOrder: () => void;
}

export default function CartDrawer({ isOpen, onClose, onProceedToOrder }: CartDrawerProps) {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      clearCart();
    }
  };

  const handleProceedToOrder = () => {
    if (cart.items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }
    onProceedToOrder();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-rose-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Mi Carrito ({cart.totalItems})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-20 h-20 text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Tu carrito está vacío</p>
                <p className="text-gray-400 text-sm mt-2">
                  Agrega productos para comenzar tu pedido
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const imageUrl = getAbsoluteImageUrl(item.product.imageUrl || '');
                  const useNextImage = isLocalUrl(imageUrl);

                  return (
                    <div
                      key={item.product.id}
                      className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-white rounded-md overflow-hidden">
                        {imageUrl ? (
                          useNextImage ? (
                            <Image
                              src={imageUrl}
                              alt={item.product.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 text-sm truncate">
                          {item.product.name}
                        </h3>
                        <p className="text-rose-600 font-bold text-sm mt-1">
                          S/ {item.product.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm font-medium px-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p className="text-xs text-gray-500 mt-1">
                          Subtotal: S/ {item.subtotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Clear Cart Button */}
                {cart.items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                  >
                    Vaciar carrito
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer - Total and Checkout */}
          {cart.items.length > 0 && (
            <div className="border-t p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-rose-600">
                  S/ {cart.totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleProceedToOrder}
                className="w-full py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors focus:outline-none focus:ring-4 focus:ring-rose-300"
              >
                Hacer Pedido
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

'use client';

import { MessageCircle, User, X } from 'lucide-react';
import { ADVISORS } from '@mi-tienda/types';
import { useCart } from '@/hooks/useCart';
import { redirectToWhatsApp } from '@/lib/whatsappUtils';

interface AdvisorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvisorSelectionModal({ isOpen, onClose }: AdvisorSelectionModalProps) {
  const { cart, clearCart } = useCart();

  if (!isOpen) return null;

  const handleSelectAdvisor = (advisor: typeof ADVISORS[0]) => {
    if (cart.items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Redirect to WhatsApp
    redirectToWhatsApp(advisor, cart.items, cart.totalAmount);

    // Optionally clear cart after sending
    // You can uncomment this if you want to clear cart after order
    // clearCart();

    // Close modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <MessageCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Elige una Asesora
          </h2>
          <p className="text-gray-600 text-sm">
            Selecciona con quién deseas continuar tu pedido por WhatsApp
          </p>
        </div>

        {/* Cart Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Productos:</span>
            <span className="font-medium">{cart.totalItems} items</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-800">Total:</span>
            <span className="text-rose-600">S/ {cart.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Advisors */}
        <div className="space-y-3">
          {ADVISORS.map((advisor) => (
            <button
              key={advisor.phone}
              onClick={() => handleSelectAdvisor(advisor)}
              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg transition-all duration-200 border-2 border-transparent hover:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-300 group"
            >
              {/* Avatar */}
              <div className="flex-shrink-0 w-14 h-14 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                {advisor.photoUrl ? (
                  <img
                    src={advisor.photoUrl}
                    alt={advisor.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800 text-lg">
                  {advisor.name}
                </h3>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {advisor.phone}
                </p>
              </div>

              {/* WhatsApp Icon */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Al seleccionar una asesora, se abrirá WhatsApp con los detalles de tu pedido
        </p>
      </div>
    </div>
  );
}

'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { cart } = useCart();

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-rose-300"
      aria-label="Ver carrito"
    >
      <ShoppingCart className="w-7 h-7" />
      {cart.totalItems > 0 && (
        <span className="absolute -top-2 -right-2 flex items-center justify-center w-7 h-7 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white animate-pulse">
          {cart.totalItems > 99 ? '99+' : cart.totalItems}
        </span>
      )}
    </button>
  );
}

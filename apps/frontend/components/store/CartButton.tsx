'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface CartButtonProps {
  onClick: () => void;
}

export default function CartButton({ onClick }: CartButtonProps) {
  const { totalItems } = useCart();
  const displayCount = totalItems > 9 ? '9+' : totalItems.toString();

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm transition-all hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
      aria-label={totalItems > 0 ? `Abrir cesta con ${totalItems} productos` : 'Abrir cesta'}
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
  <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-rose-600 shadow-sm">
          {displayCount}
        </span>
      )}
    </button>
  );
}

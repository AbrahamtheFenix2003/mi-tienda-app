'use client';

import Image from 'next/image';
import { Product } from '@mi-tienda/types';
import { User, Home, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import SearchBar from '@/components/store/SearchBar';
import { useCart } from '@/hooks/useCart';

interface PublicHeaderProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onSearchChange: (query: string) => void;
  onCartClick: () => void;
}

export default function PublicHeader({ products, onProductSelect, onSearchChange, onCartClick }: PublicHeaderProps) {
  const { cart } = useCart();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mr-auto px-4 sm:px-6 lg:pl-4 lg:pr-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {/* Replace the placeholder icon with a real logo if available in /public/logo.jpg */}
            <Image src="/logo.jpg" alt="Braholet Importaciones" width={56} height={56} className="object-cover rounded-md" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Braholet Importaciones</h1>
              <p className="text-xs text-gray-500">Tu tienda de confianza</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-rose-600 transition-colors font-medium"
            >
              <Home className="h-4 w-4" />
              Inicio
            </Link>
            <button
              onClick={onCartClick}
              className="relative flex items-center gap-2 text-gray-700 hover:text-rose-600 transition-colors font-medium"
            >
              <ShoppingCart className="h-5 w-5" />
              Carrito
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-rose-600 rounded-full">
                  {cart.totalItems > 9 ? '9+' : cart.totalItems}
                </span>
              )}
            </button>
            <Link
              href="/login"
              className="flex items-center gap-2 text-gray-700 hover:text-rose-600 transition-colors font-medium"
            >
              <User className="h-4 w-4" />
              Iniciar Sesión
            </Link>
          </nav>
        </div>

        {/* Search Bar */}
        <div className="pb-4">
          <SearchBar
            products={products}
            onProductSelect={onProductSelect}
            onSearchChange={onSearchChange}
          />
        </div>
      </div>
    </header>
  );
}

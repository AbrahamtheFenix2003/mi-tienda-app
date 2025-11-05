'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Product } from '@mi-tienda/types';
import { Search, X, Package } from 'lucide-react';
import Image from 'next/image';
import { getAbsoluteImageUrl, isLocalUrl } from '@/lib/imageUtils';

interface SearchBarProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onSearchChange: (query: string) => void;
}

export default function SearchBar({ products, onProductSelect, onSearchChange }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trimmedQuery = query.trim();
  const hasSearch = trimmedQuery.length > 0;

  const filteredProducts = useMemo(() => {
    if (!hasSearch) {
      return [];
    }

    const searchTerm = trimmedQuery.toLowerCase();

    return products
      .filter((product) => {
        if (!product.isActive) return false;

        const matchesName = product.name.toLowerCase().includes(searchTerm);
        const matchesCode = product.code.toLowerCase().includes(searchTerm);
        const matchesCategory = product.category?.name.toLowerCase().includes(searchTerm);
        const matchesTags = product.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
        const matchesDescription = product.description?.toLowerCase().includes(searchTerm);

        return matchesName || matchesCode || matchesCategory || matchesTags || matchesDescription;
      })
      .slice(0, 8);
  }, [hasSearch, trimmedQuery, products]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    const nextTrimmed = value.trim();

    if (nextTrimmed.length === 0) {
      setIsOpen(false);
      onSearchChange('');
      return;
    }

    setIsOpen(true);
    onSearchChange(value);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    onSearchChange('');
  };

  const handleSelectProduct = (product: Product) => {
    setQuery('');
    setIsOpen(false);
    onProductSelect(product);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (hasSearch) {
              setIsOpen(true);
            }
          }}
          placeholder="Buscar productos por nombre, código, categoría..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50 rounded-r-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-2 bg-gray-50 border-b border-gray-200">
            <p className="text-xs text-gray-600">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const imageUrl = product.imageUrl ? getAbsoluteImageUrl(product.imageUrl) : null;
              const hasStock = product.stock > 0;

              return (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full p-3 flex items-center gap-3 hover:bg-rose-50 transition-colors text-left"
                >
                  {/* Product Image */}
                  <div className="relative w-16 h-16 shrink-0 bg-gray-100 rounded overflow-hidden">
                    {imageUrl && isLocalUrl(imageUrl) ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500 truncate">
                      Código: {product.code}
                      {product.category && ` • ${product.category.name}`}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-rose-600">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      {!hasStock && (
                        <span className="text-xs text-red-600 font-medium">Sin stock</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && hasSearch && filteredProducts.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No se encontraron productos</p>
          <p className="text-sm text-gray-500 mt-1">
            Intenta con otro término de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}

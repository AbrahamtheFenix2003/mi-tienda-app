// components/admin/ProductSearch.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '@mi-tienda/types';

interface ProductSearchProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product | null) => void;
  placeholder?: string;
  label?: string;
  error?: string | undefined;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  placeholder = "Buscar producto...",
  label = "Producto *",
  error,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Prevenir envío del formulario con Enter en el input de búsqueda
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      // Si hay productos filtrados y solo uno, seleccionarlo automáticamente
      if (filteredProducts.length === 1) {
        handleSelect(filteredProducts[0]);
      }
    }
  };

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar dropdown solo cuando el input está enfocado, hay término de búsqueda y no hay producto seleccionado
  const showList = isFocused && !selectedProduct && searchTerm.length > 0;

  // Manejar selección de producto
  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    setSearchTerm('');
    setIsFocused(false);
  };

  // Limpiar selección
  const handleClear = () => {
    onSelectProduct(null);
    setSearchTerm('');
    setIsFocused(false);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={searchRef} className="relative">
      <label htmlFor="product-search" className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="relative mt-1">
        {/* Campo de búsqueda */}
        <div className="relative">
          <input
            id="product-search"
            type="text"
            value={selectedProduct ? selectedProduct.name : searchTerm}
            onChange={(e) => {
              // Si ya había un producto seleccionado, deseleccionarlo cuando el usuario
              // empiece a escribir para permitir una nueva búsqueda.
              if (selectedProduct) {
                onSelectProduct(null);
              }
              setSearchTerm(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`mt-1 sm:text-sm pl-10 pr-10 ${
              error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
            }`}
          />
          
          {/* Icono de búsqueda */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* Botón para limpiar (también permite deseleccionar el producto seleccionado antes de añadirlo) */}
          {(searchTerm || selectedProduct) && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Dropdown de resultados */}
        {showList && filteredProducts.length > 0 && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {filteredProducts.slice(0, 10).map((product) => (
              <div
                key={product.id}
                onClick={() => handleSelect(product)}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-blue-50"
              >
                <div className="flex items-center">
                  <div className="flex-1">
                    <span className="font-medium text-gray-900">{product.name}</span>
                    {product.code && (
                      <span className="ml-2 text-sm text-gray-500">
                        Código: {product.code}
                      </span>
                    )}
                  </div>
                  {product.price && (
                    <span className="text-sm font-medium text-green-600">
                      S/ {parseFloat(product.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {filteredProducts.length > 10 && (
              <div className="py-2 px-3 text-sm text-gray-500 bg-gray-50">
                Mostrando los primeros 10 resultados de {filteredProducts.length} productos
              </div>
            )}
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {showList && searchTerm && filteredProducts.length === 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white py-2 px-3 shadow-lg ring-1 ring-black ring-opacity-5">
            <p className="text-sm text-gray-500">
              No se encontraron productos que coincidan con &quot;{searchTerm}&quot;
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default ProductSearch;

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
  const [showList, setShowList] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar lista cuando hay término de búsqueda
  useEffect(() => {
    setShowList(searchTerm.length > 0);
  }, [searchTerm]);

  // Manejar selección de producto
  const handleSelect = (product: Product) => {
    onSelectProduct(product);
    setSearchTerm(product.name);
    setShowList(false);
  };

  // Limpiar selección
  const handleClear = () => {
    onSelectProduct(null);
    setSearchTerm('');
    setShowList(false);
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowList(false);
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowList(true)}
            placeholder={placeholder}
            className={`block w-full rounded-md border ${
              error ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 pl-10 pr-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
          />
          
          {/* Icono de búsqueda */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* Botón para limpiar */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <span className="text-gray-400 hover:text-gray-600">×</span>
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
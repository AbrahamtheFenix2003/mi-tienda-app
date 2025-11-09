// components/admin/ProductFilters.tsx

'use client';

import React, { useState } from 'react';
import { Filter, SortAsc, SortDesc } from 'lucide-react';

interface ProductFiltersProps {
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onCategoryFilter: (categoryId: number | null) => void;
  categories: { id: number; name: string }[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  onSortChange,
  onCategoryFilter,
  categories,
}) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const handleSortChange = (newSortBy: string) => {
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    onSortChange(newSortBy, newSortOrder);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value ? parseInt(e.target.value, 10) : null;
    setSelectedCategory(categoryId);
    onCategoryFilter(categoryId);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <Filter className="h-5 w-5 text-gray-500 mr-2" />
        <span className="text-sm font-medium text-gray-700">Filtros:</span>
      </div>
      
      <div className="flex flex-wrap gap-4">
        {/* Filtro por categoría */}
        <div className="flex items-center">
          <label htmlFor="category-filter" className="mr-2 text-sm text-gray-600">Categoría:</label>
          <select
            id="category-filter"
            value={selectedCategory || ''}
            onChange={handleCategoryChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Opciones de ordenamiento */}
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-600">Ordenar por:</span>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => handleSortChange('name')}
              className={`px-3 py-1 text-sm border rounded-l-md ${
                sortBy === 'name'
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Nombre
              {sortBy === 'name' && (
                sortOrder === 'asc' ? 
                <SortAsc className="inline h-4 w-4 ml-1" /> : 
                <SortDesc className="inline h-4 w-4 ml-1" />
              )}
            </button>
            <button
              onClick={() => handleSortChange('category')}
              className={`px-3 py-1 text-sm border-t border-b ${
                sortBy === 'category'
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Categoría
              {sortBy === 'category' && (
                sortOrder === 'asc' ? 
                <SortAsc className="inline h-4 w-4 ml-1" /> : 
                <SortDesc className="inline h-4 w-4 ml-1" />
              )}
            </button>
            <button
              onClick={() => handleSortChange('stock')}
              className={`px-3 py-1 text-sm border rounded-r-md ${
                sortBy === 'stock'
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Stock
              {sortBy === 'stock' && (
                sortOrder === 'asc' ? 
                <SortAsc className="inline h-4 w-4 ml-1" /> : 
                <SortDesc className="inline h-4 w-4 ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
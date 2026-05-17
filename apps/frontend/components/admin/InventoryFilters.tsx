// components/admin/InventoryFilters.tsx

'use client';

import React, { useState } from 'react';
import { Filter, SortAsc, SortDesc, Search } from 'lucide-react';

interface InventoryFiltersProps {
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onCategoryFilter: (categoryId: number | null) => void;
  onSearchFilter: (searchTerm: string) => void;
  onStockFilter: (stockFilter: string) => void;
  categories: { id: number; name: string }[];
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  onSortChange,
  onCategoryFilter,
  onSearchFilter,
  onStockFilter,
  categories,
}) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    onSearchFilter(newSearchTerm);
  };

  const handleStockFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStockFilter = e.target.value;
    setStockFilter(newStockFilter);
    onStockFilter(newStockFilter);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onSearchFilter('');
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setStockFilter('all');
    setSortBy('name');
    setSortOrder('asc');
    onSearchFilter('');
    onCategoryFilter(null);
    onStockFilter('all');
    onSortChange('name', 'asc');
  };

  const hasActiveFilters = searchTerm || selectedCategory || stockFilter !== 'all';

  return (
    <div className="flex flex-col gap-4 mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">Filtros de Inventario:</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearAllFilters}
            className="text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors"
          >
            Limpiar todos los filtros
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4">
        {/* Buscador de productos */}
        <div className="flex items-center flex-1 min-w-64">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar productos por nombre o código..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:border-rose-500 focus:ring-rose-500 focus:ring-1 text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
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

        {/* Filtro por stock */}
        <div className="flex items-center">
          <label htmlFor="stock-filter" className="mr-2 text-sm text-gray-600">Stock:</label>
          <select
            id="stock-filter"
            value={stockFilter}
            onChange={handleStockFilterChange}
            className="rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
          >
            <option value="all">Todos</option>
            <option value="available">Con stock</option>
            <option value="low">Stock bajo (menos de 10)</option>
            <option value="out">Agotado</option>
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
              className={`px-3 py-1 text-sm border-t border-b ${
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
            <button
              onClick={() => handleSortChange('totalValue')}
              className={`px-3 py-1 text-sm border rounded-r-md ${
                sortBy === 'totalValue'
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Valor Total
              {sortBy === 'totalValue' && (
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

export default InventoryFilters;
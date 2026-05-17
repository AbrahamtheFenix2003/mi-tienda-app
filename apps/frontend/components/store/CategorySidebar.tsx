'use client';

import { Category, Product } from '@mi-tienda/types';
import { Grid3x3, ChevronRight } from 'lucide-react';

interface CategorySidebarProps {
  categories: Category[];
  products: Product[];
  selectedCategoryId: number | null;
  onCategorySelect: (categoryId: number | null) => void;
}

export default function CategorySidebar({
  categories,
  products,
  selectedCategoryId,
  onCategorySelect,
}: CategorySidebarProps) {
  // Count products by category
  const getProductCount = (categoryId: number | null) => {
    if (categoryId === null) {
      return products.filter(p => p.isActive && p.stock > 0).length;
    }
    return products.filter(p => p.categoryId === categoryId && p.isActive && p.stock > 0).length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-rose-500 text-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-5 w-5" />
          <h2 className="font-semibold text-lg">Categorías</h2>
        </div>
      </div>

      {/* Categories List */}
      <div className="divide-y divide-gray-100">
        {/* All Categories Option */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full px-4 py-3 flex items-center justify-between hover:bg-rose-50 transition-colors ${
            selectedCategoryId === null ? 'bg-rose-50 border-l-4 border-rose-500' : ''
          }`}
        >
          <span className={`font-medium ${selectedCategoryId === null ? 'text-rose-600' : 'text-gray-700'}`}>
            Todas las Categorías
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${selectedCategoryId === null ? 'text-rose-600' : 'text-gray-500'}`}>
              ({getProductCount(null)})
            </span>
            <ChevronRight className={`h-4 w-4 ${selectedCategoryId === null ? 'text-rose-600' : 'text-gray-400'}`} />
          </div>
        </button>

        {/* Individual Categories */}
        {categories.map((category) => {
          const count = getProductCount(category.id);
          const isSelected = selectedCategoryId === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-rose-50 transition-colors ${
                isSelected ? 'bg-rose-50 border-l-4 border-rose-500' : ''
              }`}
            >
              <span className={`font-medium ${isSelected ? 'text-rose-600' : 'text-gray-700'}`}>
                {category.name}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isSelected ? 'text-rose-600' : 'text-gray-500'}`}>
                  ({count})
                </span>
                <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-rose-600' : 'text-gray-400'}`} />
              </div>
            </button>
          );
        })}

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No hay categorías disponibles
          </div>
        )}
      </div>
    </div>
  );
}

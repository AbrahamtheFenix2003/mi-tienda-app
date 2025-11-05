// components/admin/CategoryTable.tsx

'use client';

import { Category } from '@mi-tienda/types';
import { Edit, Trash2, FolderOpen, Eye } from 'lucide-react';

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onView?: (category: Category) => void;
}

/**
 * Componente de UI "tonto" (dumb component).
 * Muestra una lista de categorías en una tabla.
 */
export const CategoryTable = ({ categories, onEdit, onDelete, onView }: CategoryTableProps) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <FolderOpen className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {onView && (
                    <button
                      onClick={() => onView(category)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                      title="Ver Productos"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(category)}
                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors"
                    title="Editar Categoría"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(category)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors"
                    title="Eliminar Categoría"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
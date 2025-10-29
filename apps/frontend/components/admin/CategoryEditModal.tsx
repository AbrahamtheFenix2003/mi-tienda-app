// components/admin/CategoryEditModal.tsx

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Category, CategoryFormData } from '@mi-tienda/types';
import { Loader2 } from 'lucide-react';

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  isLoading: boolean;
  categoryToEdit: Category | null;
}

export const CategoryEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  categoryToEdit
}: CategoryEditModalProps) => {
  // Usar el valor inicial desde categoryToEdit
  const [categoryName, setCategoryName] = useState(() =>
    categoryToEdit?.name || ''
  );

  // Resetear el formulario cuando cambia categoryToEdit
  React.useEffect(() => {
    setCategoryName(categoryToEdit?.name || '');
  }, [categoryToEdit]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryName(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      alert('El nombre es requerido');
      return;
    }

    const formData = { name: categoryName.trim() };
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Editar Categoría' : 'Agregar Categoría'}
      size="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la categoría *
          </label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Electrónicos, Ropa, Hogar..."
            maxLength={100}
            autoFocus
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            {categoryToEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
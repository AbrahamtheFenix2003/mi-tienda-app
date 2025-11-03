// apps/frontend/app/(admin)/categorias/page.tsx

'use client'; // Necesario para usar hooks en esta página

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/services/categoryService';
import { Category, CategoryFormData } from '@mi-tienda/types';
import { CategoryTable } from '@/components/admin/CategoryTable';
import { CategoryEditModal } from '@/components/admin/CategoryEditModal';
import { CategoryDeleteModal } from '@/components/admin/CategoryDeleteModal';
import { Loader2, AlertTriangle, PlusCircle, FolderOpen } from 'lucide-react';
import { useInvalidateQueries, QUERY_KEYS } from '@/utils/queryInvalidation';

export default function CategoriasPage() {
  const queryClient = useQueryClient();
  const { invalidateAfterCategoryChange } = useInvalidateQueries();

  // Estados para modales y categoría seleccionada
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Query para obtener todas las categorías
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: errorCategories
  } = useQuery<Category[]>({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: fetchCategories,
  });

  // Mutación para crear categoría
  const createMutation = useMutation<Category, unknown, CategoryFormData>({
    mutationFn: createCategory,
    onSuccess: (newCategory: Category) => {
      // Invalidar queries relacionadas con categorías
      // Esto actualizará: categorías, productos (productos usan categorías)
      invalidateAfterCategoryChange();
      handleCloseEditModal();
      alert(`Categoría "${newCategory.name}" creada correctamente.`);
    },
    onError: (error: unknown) => {
      const e = error as { message?: string };
      console.error('Error al crear categoría:', e);
      alert(e.message ?? 'Error al crear categoría');
    },
  });

  // Mutación para actualizar categoría
  const updateMutation = useMutation<Category, unknown, { id: number; data: Partial<CategoryFormData> }>({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (updatedCategory: Category) => {
      // Invalidar queries relacionadas con categorías
      // Esto actualizará: categorías, productos (productos usan categorías)
      invalidateAfterCategoryChange();
      handleCloseEditModal();
      alert(`Categoría "${updatedCategory.name}" actualizada.`);
    },
    onError: (error: unknown) => {
      const e = error as { message?: string };
      console.error('Error al actualizar:', e);
      alert(e.message ?? 'Error al actualizar categoría');
    },
  });

  // Mutación para eliminar categoría
  const deleteMutation = useMutation<void, unknown, number>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      // Invalidar queries relacionadas con categorías
      // Esto actualizará: categorías, productos (productos usan categorías)
      invalidateAfterCategoryChange();
      handleCloseDeleteModal();
      alert('Categoría eliminada.');
    },
    onError: (error: unknown) => {
      const e = error as { message?: string };
      console.error('Error al eliminar:', e);
      alert(e.message ?? 'Error al eliminar categoría');
    },
  });

  // Handlers para abrir modales
  const handleOpenEditModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Handlers para cerrar modales
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCategory(null);
  };

  // Handlers para el formulario (desde CategoryEditModal)
  const handleFormSubmit = (data: CategoryFormData) => {
    if (selectedCategory) {
      // Actualizar categoría existente
      updateMutation.mutate({ id: selectedCategory.id, data });
    } else {
      // Crear nueva categoría
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (!selectedCategory) return;
    deleteMutation.mutate(selectedCategory.id);
  };

  // Renderizar contenido según el estado
  const renderContent = () => {
    if (isLoadingCategories) {
      return (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <Loader2 className="h-10 w-10 mr-3 animate-spin" />
          <span className="text-lg">Cargando categorías...</span>
        </div>
      );
    }

    if (errorCategories) {
      return (
        <div className="flex flex-col items-center py-20 text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-12 w-12 mb-3" />
          <span className="font-semibold text-lg">Error al cargar categorías</span>
          <span className="text-sm mt-1">{errorCategories instanceof Error ? errorCategories.message : String(errorCategories)}</span>
        </div>
      );
    }

    if (categories) {
      if (categories.length === 0) {
        return (
          <div className="text-center py-20 bg-white rounded-lg shadow border">
            <h3 className="text-xl font-semibold text-gray-800">No hay categorías</h3>
            <p className="text-gray-500 mt-2 mb-4">Aún no has creado ninguna categoría.</p>
            <button
              onClick={() => handleOpenEditModal()}
              className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <FolderOpen className="h-5 w-5 mr-2" />
              Crear primera categoría
            </button>
          </div>
        );
      }

      return (
        <CategoryTable
          categories={categories}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Categorías</h1>
          <p className="mt-1 text-gray-600">Aquí podrás crear, editar y eliminar tus categorías.</p>
        </div>
        <button
          onClick={() => handleOpenEditModal()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-sm transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Agregar Categoría
        </button>
      </div>

      {/* Contenido */}
      <div className="mt-6">{renderContent()}</div>

      {/* Modales */}
      <CategoryEditModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        categoryToEdit={selectedCategory}
      />

      <CategoryDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
        categoryName={selectedCategory?.name}
      />
    </div>
  );
}
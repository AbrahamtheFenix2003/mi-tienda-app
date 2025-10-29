// apps/frontend/app/(admin)/proveedores/page.tsx

'use client'; // Necesario para usar hooks en esta página

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/supplierService';
import { SupplierTable } from '@/components/admin/SupplierTable';
import { AddSupplierModal } from '@/components/admin/AddSupplierModal';
import { EditSupplierModal } from '@/components/admin/EditSupplierModal';
import { DeleteSupplierModal } from '@/components/admin/DeleteSupplierModal';
import { Supplier, SupplierFormData } from '@mi-tienda/types';
import { Loader2, AlertTriangle, Building2 } from 'lucide-react';
import Link from 'next/link';

/**
 * Página de administración: Lista de proveedores
 * Usa react-query para obtener datos y delega la UI a SupplierTable.
 */
export default function ProveedoresPage() {
  const queryClient = useQueryClient();

  // Estados para modales y proveedor seleccionado
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Query para obtener todos los proveedores
  const { 
    data: suppliers, 
    isLoading: isLoadingSuppliers, 
    error: errorSuppliers 
  } = useQuery<Supplier[]>({
    queryKey: ['admin-suppliers'],
    queryFn: fetchSuppliers,
  });

  // Mutación para crear proveedor
  const createMutation = useMutation<Supplier, unknown, SupplierFormData>({
    mutationFn: createSupplier,
    onSuccess: (newSupplier: Supplier) => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      setIsAddModalOpen(false);
      alert(`Proveedor "${newSupplier.name}" creado correctamente.`);
    },
    onError: (error: unknown) => {
      const e = error as { message?: string };
      console.error('Error al crear proveedor:', e);
      alert(e.message ?? 'Error al crear proveedor');
    },
  });

  // Mutación para actualizar proveedor
  const updateMutation = useMutation<Supplier, unknown, { id: number; data: Partial<SupplierFormData> }>({
    mutationFn: ({ id, data }) => updateSupplier(id, data),
    onSuccess: (updatedSupplier: Supplier) => {
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      alert(`Proveedor "${updatedSupplier.name}" actualizado.`);
    },
    onError: (error: unknown) => {
      const e = error as { message?: string };
      console.error('Error al actualizar:', e);
      alert(e.message ?? 'Error al actualizar proveedor');
    },
  });

  // Mutación para eliminar proveedor
  const deleteMutation = useMutation<void, unknown, number>({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
      alert('Proveedor eliminado.');
    },
    onError: (error: unknown) => {
      const e = error as { message?: string };
      console.error('Error al eliminar:', e);
      alert(e.message ?? 'Error al eliminar proveedor');
    },
  });

  const renderContent = () => {
    if (isLoadingSuppliers) {
      return (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <Loader2 className="h-10 w-10 mr-3 animate-spin" />
          <span className="text-lg">Cargando proveedores...</span>
        </div>
      );
    }

    if (errorSuppliers) {
      return (
        <div className="flex flex-col items-center py-20 text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-12 w-12 mb-3" />
          <span className="font-semibold text-lg">Error al cargar proveedores</span>
          <span className="text-sm mt-1">{errorSuppliers instanceof Error ? errorSuppliers.message : String(errorSuppliers)}</span>
        </div>
      );
    }

    if (suppliers) {
      if (suppliers.length === 0) {
        return (
          <div className="text-center py-20 bg-white rounded-lg shadow border">
            <h3 className="text-xl font-semibold text-gray-800">No hay proveedores</h3>
            <p className="text-gray-500 mt-2 mb-4">Aún no has creado ningún proveedor.</p>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Crear primer proveedor
            </button>
          </div>
        );
      }

      return (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <SupplierTable
              suppliers={suppliers}
              onEdit={(s: Supplier) => { setSelectedSupplier(s); setIsEditModalOpen(true); }}
              onDelete={(s: Supplier) => { setSelectedSupplier(s); setIsDeleteModalOpen(true); }}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  // Handlers para abrir modales
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  // Handlers para cerrar modales
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedSupplier(null);
  };

  // Handlers para envío de formularios
  const handleCreateSubmit = (data: SupplierFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data: Partial<SupplierFormData>) => {
    if (!selectedSupplier) return;
    updateMutation.mutate({ id: selectedSupplier.id, data });
  };

  const handleConfirmDelete = () => {
    if (!selectedSupplier) return;
    deleteMutation.mutate(selectedSupplier.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Proveedores</h1>
          <p className="mt-1 text-gray-600">Aquí podrás crear, editar y eliminar tus proveedores.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-sm transition-colors"
        >
          <Building2 className="h-5 w-5 mr-2" />
          Agregar Proveedor
        </button>
      </div>

      <div className="mt-6">{renderContent()}</div>

      {/* Modales */}
      {isAddModalOpen && (
        <AddSupplierModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onFormSubmit={handleCreateSubmit}
          isLoading={createMutation.isPending}
        />
      )}

      {isEditModalOpen && selectedSupplier && (
        <EditSupplierModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          supplierToEdit={selectedSupplier}
          onFormSubmit={handleUpdateSubmit}
          isLoading={updateMutation.isPending}
        />
      )}

      {isDeleteModalOpen && selectedSupplier && (
        <DeleteSupplierModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          supplierName={selectedSupplier.name}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
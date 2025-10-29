// components/admin/EditSupplierModal.tsx

'use client';

import { useEffect } from 'react';
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema, SupplierFormData, Supplier } from '@mi-tienda/types';
import { Modal } from '@/components/ui/Modal';
import { SupplierForm } from './SupplierForm';

interface EditSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit: Supplier | null;
  onFormSubmit: (data: SupplierFormData) => void;
  isLoading: boolean;
}

export const EditSupplierModal = ({
  isOpen,
  onClose,
  supplierToEdit,
  onFormSubmit,
  isLoading,
}: EditSupplierModalProps) => {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema) as Resolver<SupplierFormData>,
  });

  // Cargar datos del proveedor en el formulario cuando cambie supplierToEdit
  useEffect(() => {
    if (supplierToEdit) {
      form.reset({
        name: supplierToEdit.name,
        contact: supplierToEdit.contact ?? '',
        phone: supplierToEdit.phone ?? '',
        email: supplierToEdit.email ?? '',
        address: supplierToEdit.address ?? '',
      });
    } else {
      form.reset({
        name: '',
        contact: '',
        phone: '',
        email: '',
        address: '',
      });
    }
  }, [supplierToEdit, form]);

  const handleInternalSubmit = (data: SupplierFormData) => {
    // Delegamos el submit al padre. NO cerramos el modal aquí; el padre decidirá si cerrarlo
    // tras actualizar el proveedor según su lógica.
    onFormSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Proveedor"
      size="xl"
    >
      {supplierToEdit && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">ID:</span>{' '}
            <span className="font-mono text-gray-900">{supplierToEdit.id}</span>
          </div>
        </div>
      )}
      <SupplierForm
        key={supplierToEdit?.id || 'new'} // Forzar re-render cuando cambia el proveedor
        form={form as unknown as UseFormReturn<SupplierFormData>}
        onSubmit={handleInternalSubmit}
        isLoading={isLoading}
        buttonText="Guardar Cambios"
      />
    </Modal>
  );
};

export default EditSupplierModal;
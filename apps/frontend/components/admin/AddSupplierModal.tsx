// components/admin/AddSupplierModal.tsx

'use client';

import { useEffect } from 'react';
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema, SupplierFormData } from '@mi-tienda/types';
import { Modal } from '@/components/ui/Modal';
import { SupplierForm } from './SupplierForm';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormSubmit: (data: SupplierFormData) => void;
  isLoading: boolean;
}

export const AddSupplierModal = ({
  isOpen,
  onClose,
  onFormSubmit,
  isLoading,
}: AddSupplierModalProps) => {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema) as Resolver<SupplierFormData>,
  });

  // Resetear el formulario cada vez que el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      form.reset({
        name: '',
        contact: '',
        phone: '',
        email: '',
        address: '',
      });
    }
  }, [isOpen, form]);

  const handleInternalSubmit = (data: SupplierFormData) => {
    // Delegamos el submit al padre. NO cerramos el modal aquí; el padre decidirá si cerrarlo
    // tras crear el proveedor según su lógica.
    onFormSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agregar Nuevo Proveedor"
      size="xl"
    >
      <SupplierForm
        form={form as unknown as UseFormReturn<SupplierFormData>}
        onSubmit={handleInternalSubmit}
        isLoading={isLoading}
        buttonText="Crear Proveedor"
      />
    </Modal>
  );
};

export default AddSupplierModal;
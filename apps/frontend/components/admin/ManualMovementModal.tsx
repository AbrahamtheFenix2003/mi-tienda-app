'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../ui/Modal';
import { ManualMovementForm } from './ManualMovementForm';
import { createManualMovement, updateManualMovement } from '../../services/cashService';
import type { CashMovementWithRelations, CreateManualMovementInput, UpdateManualMovementInput } from '@mi-tienda/types';
import { manualMovementSchema } from '@mi-tienda/types';

interface ManualMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  movementToEdit: CashMovementWithRelations | null;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const ManualMovementModal = ({ isOpen, onClose, movementToEdit }: ManualMovementModalProps) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(movementToEdit);

  // Configurar React Hook Form
  const form = useForm<CreateManualMovementInput>({
    resolver: zodResolver(manualMovementSchema),
    defaultValues: {
      type: movementToEdit?.type === 'ENTRADA' || movementToEdit?.type === 'SALIDA'
        ? movementToEdit.type
        : 'ENTRADA',
      amount: movementToEdit?.amount ? Number(movementToEdit.amount) : 0,
      description: movementToEdit?.description || '',
      category: movementToEdit?.category || '',
      date: movementToEdit?.date
        ? new Date(movementToEdit.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      paymentMethod: movementToEdit?.paymentMethod || 'EFECTIVO',
    },
  });

  // Resetear el formulario cuando cambia el movementToEdit
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        type: movementToEdit?.type === 'ENTRADA' || movementToEdit?.type === 'SALIDA'
          ? movementToEdit.type
          : 'ENTRADA',
        amount: movementToEdit?.amount ? Number(movementToEdit.amount) : 0,
        description: movementToEdit?.description || '',
        category: movementToEdit?.category || '',
        date: movementToEdit?.date
          ? new Date(movementToEdit.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        paymentMethod: movementToEdit?.paymentMethod || 'EFECTIVO',
      });
    }
  }, [isOpen, movementToEdit, form]);

  const createMutation = useMutation({
    mutationFn: (data: CreateManualMovementInput) => createManualMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashMovements'] });
      setError(null);
      onClose();
    },
    onError: (err: ApiError | unknown) => {
      let errorMessage = 'Error al crear el movimiento';
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as ApiError;
        errorMessage = apiError.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateManualMovementInput }) =>
      updateManualMovement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashMovements'] });
      setError(null);
      onClose();
    },
    onError: (err: ApiError | unknown) => {
      let errorMessage = 'Error al actualizar el movimiento';
      if (err && typeof err === 'object' && 'response' in err) {
        const apiError = err as ApiError;
        errorMessage = apiError.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
    },
  });

  const handleSubmit = (data: CreateManualMovementInput) => {
    setError(null);
    
    if (isEditMode && movementToEdit) {
      updateMutation.mutate({ id: movementToEdit.id, data: data as UpdateManualMovementInput });
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Movimiento' : 'Nuevo Movimiento'}
      size="lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <ManualMovementForm
        form={form}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialData={movementToEdit}
      />
    </Modal>
  );
};
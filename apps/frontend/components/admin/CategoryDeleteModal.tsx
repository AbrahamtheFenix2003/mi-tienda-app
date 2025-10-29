// components/admin/CategoryDeleteModal.tsx

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Loader2, AlertTriangle } from 'lucide-react';

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  categoryName?: string;
}

export const CategoryDeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading, 
  categoryName 
}: CategoryDeleteModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Eliminación"
      size="sm"
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ¿Estás seguro?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Esta acción no se puede deshacer. Se eliminará permanentemente la categoría{' '}
          <span className="font-semibold">&quot;{categoryName}&quot;</span>.
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  );
};
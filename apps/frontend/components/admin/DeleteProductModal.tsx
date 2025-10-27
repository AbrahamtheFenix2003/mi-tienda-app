// components/admin/DeleteProductModal.tsx

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  productName?: string;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  productName,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar eliminación" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          {productName
            ? `¿Estás seguro de que deseas eliminar "${productName}"? Esta acción no se puede deshacer.`
            : '¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.'}
        </p>

        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProductModal;
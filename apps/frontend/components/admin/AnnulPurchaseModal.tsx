// components/admin/AnnulPurchaseModal.tsx

'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Loader2 } from 'lucide-react';

interface AnnulPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  purchaseIdentifier?: string;
}

export const AnnulPurchaseModal: React.FC<AnnulPurchaseModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  purchaseIdentifier,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Anular Compra" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Se cambiará el estado a ANULADA y se revertirá el stock de los lotes asociados (solo si no han sido utilizados). ¿Estás seguro de que deseas anular la compra `{purchaseIdentifier}`? Esta acción no se puede deshacer.
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
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Anulando...
              </>
            ) : (
              'Sí, Anular'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AnnulPurchaseModal;
import React from 'react';
import { Modal } from '../ui/Modal';
import { CashMovementWithRelations } from '@mi-tienda/types';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface CashMovementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: CashMovementWithRelations | null;
}

export const CashMovementDetailsModal: React.FC<CashMovementDetailsModalProps> = ({
  isOpen,
  onClose,
  movement,
}) => {
  if (!movement) return null;

  const isIncome = movement.type === 'ENTRADA';
  const amount = Number(movement.amount);
  const previousBalance = Number(movement.previousBalance);
  const newBalance = Number(movement.newBalance);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      timeZone: 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Movimiento"
      size="md"
    >
      <div className="space-y-6">
        {/* Encabezado con Monto y Tipo */}
        <div className={`flex flex-col items-center justify-center p-6 rounded-lg ${isIncome ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {isIncome ? (
              <ArrowUpCircle className="w-8 h-8 text-green-600" />
            ) : (
              <ArrowDownCircle className="w-8 h-8 text-red-600" />
            )}
            <span className={`text-lg font-semibold ${isIncome ? 'text-green-700' : 'text-red-700'}`}>
              {isIncome ? 'Ingreso' : 'Egreso'}
            </span>
          </div>
          <span className={`text-4xl font-bold ${isIncome ? 'text-green-800' : 'text-red-800'}`}>
            {formatCurrency(Math.abs(amount))}
          </span>
        </div>

        {/* Detalles Principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Fecha</p>
            <p className="text-base text-gray-900 capitalize">
              {formatDate(String(movement.date || movement.createdAt))}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Categoría</p>
            <p className="text-base text-gray-900">{movement.category || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Método de Pago</p>
            <p className="text-base text-gray-900">{movement.paymentMethod || '-'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Usuario</p>
            <p className="text-base text-gray-900">{movement.user?.name || movement.user?.email || '-'}</p>
          </div>
        </div>

        {/* Descripción */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">Descripción</p>
          <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">
            {movement.description || 'Sin descripción'}
          </p>
        </div>

        {/* Saldos */}
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Impacto en Caja</h4>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Saldo Anterior</p>
              <p className="text-lg font-medium text-gray-700">{formatCurrency(previousBalance)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Nuevo Saldo</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(newBalance)}</p>
            </div>
          </div>
        </div>

        {/* Referencia */}
        {movement.referenceId && (
          <div className="text-xs text-gray-400 text-center pt-2">
            ID Referencia: {movement.referenceId}
          </div>
        )}
      </div>
    </Modal>
  );
};
'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CreateManualMovementInput, CashMovementWithRelations, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@mi-tienda/types';
import { Loader2 } from 'lucide-react';

// --- Componentes de Formulario Reutilizables ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
}

const FormInput: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className={`mt-1 sm:text-sm ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}

const FormSelect: React.FC<SelectProps> = ({ label, id, error, children, className = '', ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={id}
      {...props}
      className={`mt-1 sm:text-sm ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''} ${className}`}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// --- Componente Principal del Formulario ---

interface ManualMovementFormProps {
  form: UseFormReturn<CreateManualMovementInput>;
  onSubmit: (data: CreateManualMovementInput) => void | Promise<void>;
  isLoading?: boolean;
  initialData?: CashMovementWithRelations | null;
}

export const ManualMovementForm: React.FC<ManualMovementFormProps> = ({
  form,
  onSubmit,
  isLoading = false,
  initialData,
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;
  const typeValue = watch('type');

  // Obtener categorías disponibles según el tipo seleccionado
  const availableCategories = typeValue === 'ENTRADA'
    ? INCOME_CATEGORIES
    : typeValue === 'SALIDA'
    ? EXPENSE_CATEGORIES
    : [];

  // Convertir fecha string a Date para el input date si existe initialData
  React.useEffect(() => {
    if (initialData?.date) {
      const date = new Date(initialData.date);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      setValue('date', dateString);
    }
  }, [initialData, setValue]);

  // Resetear categoría cuando cambia el tipo
  React.useEffect(() => {
    if (typeValue) {
      setValue('category', '');
    }
  }, [typeValue, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 shadow border rounded-lg">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Columna Izquierda */}
          <div className="space-y-6">
            <FormSelect
              label="Tipo *"
              id="type"
              {...register('type')}
              error={errors.type?.message as string | undefined}
              defaultValue={initialData?.type || ''}
            >
              <option value="">Seleccionar tipo</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </FormSelect>

            <FormInput
              label="Monto *"
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message as string | undefined}
              placeholder="0.00"
              defaultValue={initialData?.amount ? Number(initialData.amount) : ''}
            />

            <FormInput
              label="Descripción *"
              id="description"
              {...register('description')}
              error={errors.description?.message as string | undefined}
              placeholder="Ej: Venta de productos, Pago de servicios, etc."
              defaultValue={initialData?.description || ''}
            />
          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
            <FormSelect
              label="Categoría *"
              id="category"
              {...register('category')}
              error={errors.category?.message as string | undefined}
              defaultValue={initialData?.category || ''}
            >
              <option value="">Seleccionar categoría</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </FormSelect>

            <FormInput
              label="Fecha *"
              id="date"
              type="date"
              {...register('date')}
              error={errors.date?.message as string | undefined}
            />

            <FormSelect
              label="Método de Pago *"
              id="paymentMethod"
              {...register('paymentMethod')}
              error={errors.paymentMethod?.message as string | undefined}
              defaultValue={initialData?.paymentMethod || ''}
            >
              <option value="">Seleccionar método</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CREDITO">Crédito</option>
            </FormSelect>
          </div>

        </div>
      </div>

      {/* Botón de Envío */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full sm:w-auto justify-center rounded-md border border-transparent bg-rose-500 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-rose-300"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            initialData ? 'Actualizar Movimiento' : 'Guardar Movimiento'
          )}
        </button>
      </div>
    </form>
  );
};

export default ManualMovementForm;

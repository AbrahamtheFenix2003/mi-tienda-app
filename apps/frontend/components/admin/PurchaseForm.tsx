// components/admin/PurchaseForm.tsx

'use client';

import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { PurchaseFormData, Supplier, Product } from '@mi-tienda/types';
import { Loader2, Plus, Trash2 } from 'lucide-react';

// --- Componentes de Formulario Reutilizables (copiados de ProductForm) ---

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

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | undefined;
}

const FormTextarea: React.FC<TextareaProps> = ({ label, id, error, className = '', ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
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

interface PurchaseFormProps {
  form: UseFormReturn<PurchaseFormData>;
  onSubmit: (data: PurchaseFormData) => void | Promise<void>;
  isLoading: boolean;
  suppliers: Supplier[];
  products: Product[];
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  form,
  onSubmit,
  isLoading,
  suppliers,
  products,
}) => {
  const { register, handleSubmit, control, formState: { errors } } = form;

  // Hook para manejar el array dinámico de items
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  // Opciones para el método de pago
  const paymentMethods = [
    'EFECTIVO',
    'TRANSFERENCIA', 
    'YAPE',
    'PLIN',
    'CHEQUE',
    'CREDITO'
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Sección 1: Datos de la Compra */}
        <div className="bg-white p-6 md:p-8 shadow border rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Datos de la Compra
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proveedor */}
            <FormSelect
              label="Proveedor *"
              id="supplierId"
              {...register('supplierId', { valueAsNumber: true })}
              error={errors.supplierId?.message as string | undefined}
            >
              <option value={0}>Seleccionar proveedor...</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </FormSelect>

            {/* Fecha de Compra */}
            <FormInput
              label="Fecha de Compra *"
              id="purchaseDate"
              type="date"
              {...register('purchaseDate')}
              error={errors.purchaseDate?.message as string | undefined}
            />

            {/* El número de factura se genera automáticamente */}

            {/* Método de Pago */}
            <FormSelect
              label="Método de Pago"
              id="paymentMethod"
              {...register('paymentMethod')}
              error={errors.paymentMethod?.message as string | undefined}
            >
              <option value="">Seleccionar método...</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </FormSelect>

            {/* Notas - Ocupa toda la fila */}
            <div className="md:col-span-2">
              <FormTextarea
                label="Notas"
                id="notes"
                {...register('notes')}
                error={errors.notes?.message as string | undefined}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Sección 2: Items de la Compra */}
        <div className="bg-white p-6 md:p-8 shadow border rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Items de la Compra
            </h3>
            
            {/* Botón Agregar Producto */}
            <button
              type="button"
              onClick={() => append({ 
                productId: 0, 
                quantity: 1, 
                purchasePrice: 0.01, 
                fechaVencimiento: null,
                loteId: null 
              })}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </button>
          </div>

          {/* Error general del array */}
          {errors.items?.message && (
            <p className="mb-4 text-sm text-red-600">{errors.items?.message}</p>
          )}

          {/* Lista de Items */}
          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 mb-4 bg-gray-50">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-700">
                  Producto #{index + 1}
                </h4>
                
                {/* Botón Eliminar Item */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                  title="Eliminar item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Producto */}
                <FormSelect
                  label="Producto *"
                  id={`productId-${index}`}
                  {...register(`items.${index}.productId`, { valueAsNumber: true })}
                  error={errors.items?.[index]?.productId?.message as string | undefined}
                >
                  <option value={0}>Seleccionar producto...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </FormSelect>

                {/* Cantidad */}
                <FormInput
                  label="Cantidad *"
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  error={errors.items?.[index]?.quantity?.message as string | undefined}
                  placeholder="1"
                />

                {/* Precio Compra Unitario */}
                <FormInput
                  label="Precio Compra (S/) *"
                  id={`purchasePrice-${index}`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  {...register(`items.${index}.purchasePrice`, { valueAsNumber: true })}
                  error={errors.items?.[index]?.purchasePrice?.message as string | undefined}
                  placeholder="0.00"
                />

                {/* Fecha Vencimiento */}
                <FormInput
                  label="Fecha Venc."
                  id={`fechaVencimiento-${index}`}
                  type="date"
                  {...register(`items.${index}.fechaVencimiento`)}
                  error={errors.items?.[index]?.fechaVencimiento?.message as string | undefined}
                />
              </div>

              {/* Campo Lote (opcional) - podemos agregarlo si es necesario */}
              <div className="mt-4">
                <FormInput
                  label="Lote (Opcional)"
                  id={`loteId-${index}`}
                  {...register(`items.${index}.loteId`)}
                  error={errors.items?.[index]?.loteId?.message as string | undefined}
                  placeholder="Ej: LOTE-001"
                />
              </div>
            </div>
          ))}

          {/* Mensaje cuando no hay items */}
          {fields.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No hay productos agregados a la compra
              </p>
              <button
                type="button"
                onClick={() => append({ 
                  productId: 0, 
                  quantity: 1, 
                  purchasePrice: 0.01, 
                  fechaVencimiento: null,
                  loteId: null 
                })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Producto
              </button>
            </div>
          )}
        </div>

        {/* Sección 3: Botón de Envío */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Guardando Compra...
              </>
            ) : (
              'Guardar Compra'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PurchaseForm;

// components/admin/SupplierForm.tsx

'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { SupplierFormData, supplierSchema } from '@mi-tienda/types';
import { Loader2 } from 'lucide-react';

// --- Componentes de Formulario Reutilizables ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | undefined;
}

const FormInput: React.FC<InputProps> = ({ label, id, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className={`mt-1 block w-full rounded-md border ${
        error ? 'border-red-500' : 'border-gray-300'
      } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | undefined;
}

const FormTextarea: React.FC<TextareaProps> = ({ label, id, error, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <textarea
      id={id}
      {...props}
      className={`mt-1 block w-full rounded-md border ${
        error ? 'border-red-500' : 'border-gray-300'
      } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// --- Interfaz de Props ---

interface SupplierFormProps {
  form: UseFormReturn<SupplierFormData>;
  onSubmit: (data: SupplierFormData) => void | Promise<void>;
  isLoading?: boolean;
  buttonText?: string;
}

// --- Componente Principal ---

export const SupplierForm: React.FC<SupplierFormProps> = ({
  form,
  onSubmit,
  isLoading = false,
  buttonText = 'Guardar Proveedor',
}) => {
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 md:p-8 shadow border rounded-lg">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Campo: Nombre (requerido) */}
          <div>
            <FormInput
              label="Nombre del Proveedor"
              id="name"
              type="text"
              {...register('name')}
              error={errors.name?.message as string | undefined}
              placeholder="Ej: Proveedor ABC S.A.C."
              required
            />
          </div>

          {/* Campo: Contacto (opcional) */}
          <div>
            <FormInput
              label="Persona de Contacto"
              id="contact"
              type="text"
              {...register('contact')}
              error={errors.contact?.message as string | undefined}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Campo: Teléfono (opcional) */}
          <div>
            <FormInput
              label="Teléfono"
              id="phone"
              type="tel"
              {...register('phone')}
              error={errors.phone?.message as string | undefined}
              placeholder="Ej: +51 999 888 777"
            />
          </div>

          {/* Campo: Email (opcional) */}
          <div>
            <FormInput
              label="Email"
              id="email"
              type="email"
              {...register('email')}
              error={errors.email?.message as string | undefined}
              placeholder="Ej: contacto@proveedor.com"
            />
          </div>

          {/* Campo: Dirección (opcional) - ocupa 2 columnas */}
          <div className="md:col-span-2">
            <FormTextarea
              label="Dirección"
              id="address"
              {...register('address')}
              error={errors.address?.message as string | undefined}
              placeholder="Ej: Av. Principal 123, Lima, Perú"
              rows={3}
            />
          </div>

        </div>
      </div>

      {/* Botón de Envío */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full sm:w-auto justify-center rounded-md border border-transparent bg-blue-500 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Guardando...
            </div>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </form>
  );
};

export default SupplierForm;
'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData, Category } from '@mi-tienda/types';
import { Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';

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
      } px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500 sm:text-sm`}
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
      } px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500 sm:text-sm`}
    />
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}

const FormSelect: React.FC<SelectProps> = ({ label, id, error, children, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <select
      id={id}
      {...props}
      className={`mt-1 block w-full rounded-md border ${
        error ? 'border-red-500' : 'border-gray-300'
      } px-3 py-2 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-rose-500 sm:text-sm`}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

// --- Componente Principal del Formulario ---

interface ProductFormProps {
  form: UseFormReturn<ProductFormData>;
  onSubmit: (data: ProductFormData) => void | Promise<void>;
  isLoading?: boolean;
  categories: Category[];
  // Nuevas props para manejo de imagen
  onImageChange: (file: File | null) => void;
  currentImageUrl?: string | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  form,
  onSubmit,
  isLoading = false,
  categories,
  onImageChange,
  currentImageUrl,
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = form;

  // Estado local para preview de imagen seleccionada
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Observamos el valor imageUrl del formulario (por si viene en edición)
  const formImageUrl = watch('imageUrl');

  const displayImageUrl = imagePreview ?? formImageUrl ?? currentImageUrl;

  // Limpiar preview cuando cambie el producto (currentImageUrl)
  useEffect(() => {
    setImagePreview(null);
    if (currentImageUrl) {
      console.log('URL de imagen actual:', currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    } else {
      setImagePreview(null);
      onImageChange(null);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white p-6 md:p-8 shadow border rounded-lg">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          {/* Columna Izquierda */}
          <div className="space-y-6">
            <FormInput
              label="Nombre del Producto"
              id="name"
              {...register('name')}
              error={errors.name?.message as string | undefined}
              placeholder="Ej: Laptop Pro"
            />
            <FormInput
              label="Slug (URL Amigable)"
              id="slug"
              {...register('slug')}
              error={errors.slug?.message as string | undefined}
              placeholder="ej: laptop-pro-g1"
            />
            <FormTextarea
              label="Descripción"
              id="description"
              {...register('description')}
              error={errors.description?.message as string | undefined}
              placeholder="Descripción corta..."
              rows={4}
            />
            <FormSelect
              label="Categoría"
              id="categoryId"
              {...register('categoryId')}
              error={errors.categoryId?.message as string | undefined}
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </FormSelect>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
            <FormInput
              label="Precio de Venta (S/)"
              id="price"
              type="number"
              step="0.01"
              {...register('price')}
              error={errors.price?.message as string | undefined}
              placeholder="1500.00"
            />
            <FormInput
              label="Stock Inicial"
              id="stock"
              type="number"
              step="1"
              {...register('stock')}
              error={errors.stock?.message as string | undefined}
              placeholder="50"
            />
            <FormInput
              label="Precio Original (S/) (Opcional)"
              id="originalPrice"
              type="number"
              step="0.01"
              {...register('originalPrice')}
              error={errors.originalPrice?.message as string | undefined}
              placeholder="1800.00"
            />
            <FormInput
              label="Costo de Adquisición (S/) (Opcional)"
              id="acquisitionCost"
              type="number"
              step="0.01"
              {...register('acquisitionCost')}
              error={errors.acquisitionCost?.message as string | undefined}
              placeholder="1000.00"
            />
          </div>

          {/* Campo de imagen - se coloca al final para que ocupe todo el ancho en pantallas pequeñas */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen Principal
            </label>
            <div
              className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-rose-400 h-64"
              onClick={handleImageClick}
            >
              <div className="space-y-1 text-center w-full">
                {displayImageUrl ? (
                  <div className="flex items-center justify-center h-48 w-full">
                    <img
                      src={displayImageUrl}
                      alt="Vista previa"
                      className="max-h-48 max-w-full object-contain rounded"
                      onError={(e) => {
                        console.error('Error al cargar imagen:', displayImageUrl);
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <ImageIcon className="mx-auto h-4 w-4 text-gray-300 mt-2" />
                  </div>
                )}
                <div className="flex text-sm text-gray-600 justify-center">
                  <span className="relative font-medium text-rose-600 hover:text-rose-500">
                    {displayImageUrl ? 'Cambiar imagen' : 'Subir una imagen'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP hasta 5MB</p>
                <input
                  id="image-upload"
                  name="image"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>
            </div>
            {errors.imageUrl && <p className="mt-1 text-xs text-red-600">{errors.imageUrl?.message as string}</p>}
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
            'Guardar Producto'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
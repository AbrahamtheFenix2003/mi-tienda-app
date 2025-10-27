'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormData, Category } from '@mi-tienda/types';
import { Loader2, UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { isLocalUrl } from '@/lib/imageUtils';

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
  // Nuevas props para manejo de múltiples imágenes
  onImageChange?: (file: File, index: number) => void;
  onImageDelete?: (index: number) => void;
  currentImageUrls?: (string | null)[];
}

export const ProductForm: React.FC<ProductFormProps> = ({
  form,
  onSubmit,
  isLoading = false,
  categories,
  onImageChange,
  onImageDelete,
  currentImageUrls = [],
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = form;

  // Estado local para previews de imágenes seleccionadas (hasta 3)
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // NO usar useEffect para limpiar previews automáticamente
  // Las previews solo se limpiarán cuando el usuario seleccione una nueva imagen
  // o cuando se desmonte el componente

  const handleImageChangeInternal = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = reader.result as string;
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);

      // Notificar al padre con el archivo y el índice
      if (onImageChange) {
        onImageChange(file, index);
      }
    } else {
      setImagePreviews(prev => {
        const newPreviews = [...prev];
        newPreviews[index] = null;
        return newPreviews;
      });
    }
  };

  const handleImageClick = (index: number) => () => {
    fileInputRefs[index].current?.click();
  };

  const handleDeleteClick = (index: number) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevenir que se abra el selector de archivos
    if (onImageDelete) {
      onImageDelete(index);
    }
  };

  const getDisplayImageUrl = (index: number): string | null => {
    // Priorizar: preview local > URL del servidor > null
    if (imagePreviews[index]) return imagePreviews[index];
    if (currentImageUrls[index]) return currentImageUrls[index];
    return null;
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

          {/* Campos de imágenes - hasta 3 imágenes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Imágenes del Producto (hasta 3)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => {
                const displayUrl = getDisplayImageUrl(index);
                return (
                  <div key={index} className="relative">
                    <div
                      className="flex justify-center items-center px-4 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-rose-400 h-48"
                      onClick={handleImageClick(index)}
                    >
                      <div className="space-y-1 text-center w-full">
                        {displayUrl ? (
                          <div className="flex items-center justify-center h-32 w-full">
                            {isLocalUrl(displayUrl) ? (
                              // Usar <img> nativo para URLs locales (blob, data, localhost)
                              // Next.js Image no soporta blob/data URLs y tiene problemas con localhost
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={displayUrl}
                                alt={`Vista previa ${index + 1}`}
                                className="max-h-32 max-w-full object-contain rounded"
                                onError={() => {
                                  console.error(`Error al cargar imagen ${index + 1}:`, displayUrl);
                                }}
                              />
                            ) : (
                              // Usar Next.js Image para URLs de producción (optimización)
                              <Image
                                src={displayUrl}
                                alt={`Vista previa ${index + 1}`}
                                width={128}
                                height={128}
                                className="max-h-32 max-w-full object-contain rounded"
                                onError={() => {
                                  console.error(`Error al cargar imagen ${index + 1}:`, displayUrl);
                                }}
                              />
                            )}
                          </div>
                        ) : (
                          <div>
                            <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                            <ImageIcon className="mx-auto h-4 w-4 text-gray-300 mt-2" />
                          </div>
                        )}
                        <div className="flex text-xs text-gray-600 justify-center">
                          <span className="relative font-medium text-rose-600 hover:text-rose-500">
                            {displayUrl ? 'Cambiar' : `Imagen ${index + 1}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP</p>
                        <input
                          id={`image-upload-${index}`}
                          name={`image-${index}`}
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          ref={fileInputRefs[index]}
                          onChange={handleImageChangeInternal(index)}
                        />
                      </div>
                    </div>
                    {/* Botón de eliminar - solo visible si hay imagen */}
                    {displayUrl && onImageDelete && (
                      <button
                        type="button"
                        onClick={handleDeleteClick(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                        title="Eliminar imagen"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
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
// components/admin/EditProductModal.tsx

'use client';

import { useEffect, useMemo } from 'react';
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormData, Product, Category, createProductSchemaWithUniqueValidation } from '@mi-tienda/types';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/components/admin/ProductForm';
import { getAbsoluteImageUrl } from '@/lib/imageUtils';
import { isProductNameUnique, isProductSlugUnique } from '@/lib/productValidators';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onFormSubmit: (data: ProductFormData) => void;
  isLoading: boolean;
  categories: Category[];
  // Prop para propagar el cambio de una imagen individual con su índice
  onImageChange?: (file: File, index: number) => void;
  onImageDelete?: (index: number) => void;
  // Errores del servidor por campo
  serverErrors?: Record<string, string>;
  // Lista de productos para validar unicidad
  allProducts?: Product[];
}

export const EditProductModal = ({
  isOpen,
  onClose,
  productToEdit,
  onFormSubmit,
  isLoading,
  categories,
  onImageChange,
  onImageDelete,
  serverErrors = {},
  allProducts = [],
}: EditProductModalProps) => {
  // Crear schema con validación personalizada, excluyendo el producto actual
  const validationSchema = useMemo(() => {
    return createProductSchemaWithUniqueValidation({
      isNameUnique: (name) => isProductNameUnique(name, allProducts, productToEdit?.id),
      isSlugUnique: (slug) => isProductSlugUnique(slug, allProducts, productToEdit?.id),
    });
  }, [allProducts, productToEdit?.id]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(validationSchema) as Resolver<ProductFormData>,
  });

  useEffect(() => {
    if (productToEdit) {
      form.reset({
        name: productToEdit.name,
        slug: productToEdit.slug,
        description: productToEdit.description ?? '',
        price: Number(productToEdit.price),
        originalPrice:
          productToEdit.originalPrice === null || productToEdit.originalPrice === undefined || productToEdit.originalPrice === ''
            ? null
            : Number(productToEdit.originalPrice),
        acquisitionCost:
          productToEdit.acquisitionCost === null || productToEdit.acquisitionCost === undefined || productToEdit.acquisitionCost === ''
            ? null
            : Number(productToEdit.acquisitionCost),
        categoryId: productToEdit.categoryId ?? undefined,
        // NO incluimos imageUrl aquí - solo se usa para nuevas imágenes
        imageUrl: undefined,
        isFeatured: productToEdit.isFeatured ?? false,
      });
    } else {
      form.reset();
    }
  }, [productToEdit, form]);

  // Actualizar errores del servidor cuando cambian
  useEffect(() => {
    if (serverErrors && Object.keys(serverErrors).length > 0) {
      Object.entries(serverErrors).forEach(([field, message]) => {
        form.setError(field as any, {
          type: 'server',
          message: message,
        });
      });
    }
  }, [serverErrors, form]);

  const handleInternalSubmit = (data: ProductFormData) => {
    // Delegamos el submit al padre. NO cerramos el modal aquí; el padre decidirá si cerrarlo
    // tras actualizar y/o subir imagen según su lógica.
    onFormSubmit(data);
  };

  const currentImageUrls = useMemo(
    () => [
      getAbsoluteImageUrl(productToEdit?.imageUrl),
      getAbsoluteImageUrl(productToEdit?.imageUrl2),
      getAbsoluteImageUrl(productToEdit?.imageUrl3),
    ],
    [productToEdit?.imageUrl, productToEdit?.imageUrl2, productToEdit?.imageUrl3],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Producto"
      size="xl"
    >
      {productToEdit && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">SKU:</span>{' '}
            <span className="font-mono text-gray-900">{productToEdit.code}</span>
          </div>
        </div>
      )}
      <ProductForm
        key={productToEdit?.id || 'new'} // Forzar re-render cuando cambia el producto
        form={form as unknown as UseFormReturn<ProductFormData>}
        onSubmit={handleInternalSubmit}
        isLoading={isLoading}
        categories={categories}
        onImageChange={onImageChange}
        onImageDelete={onImageDelete}
        currentImageUrls={currentImageUrls}
      />
    </Modal>
  );
};

// components/admin/EditProductModal.tsx

'use client';

import { useEffect, useMemo } from 'react';
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormData, Product, Category } from '@mi-tienda/types';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/components/admin/ProductForm';
import { getAbsoluteImageUrl } from '@/lib/imageUtils';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onFormSubmit: (data: ProductFormData) => void;
  isLoading: boolean;
  categories: Category[];
  // Prop para propagar el cambio de imágenes al padre
  onImagesChange: (files: File[]) => void;
}

export const EditProductModal = ({
  isOpen,
  onClose,
  productToEdit,
  onFormSubmit,
  isLoading,
  categories,
  onImagesChange,
}: EditProductModalProps) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
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
        stock: productToEdit.stock ?? 0,
        categoryId: productToEdit.categoryId ?? '',
        // NO incluimos imageUrl aquí - solo se usa para nuevas imágenes
        imageUrl: undefined,
        isFeatured: productToEdit.isFeatured ?? false,
      });
    } else {
      form.reset();
    }
  }, [productToEdit, form]);

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
      onClose={() => {
        // Aseguramos limpiar las imágenes seleccionadas cuando se cierre el modal
        onImagesChange([]);
        onClose();
      }}
      title="Editar Producto"
      size="xl"
    >
      <ProductForm
        form={form as unknown as UseFormReturn<ProductFormData>}
        onSubmit={handleInternalSubmit}
        isLoading={isLoading}
        categories={categories}
        onImagesChange={onImagesChange}
        currentImageUrls={currentImageUrls}
      />
    </Modal>
  );
};

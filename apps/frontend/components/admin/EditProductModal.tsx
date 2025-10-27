// components/admin/EditProductModal.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormData, Product, Category } from '@mi-tienda/types';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/components/admin/ProductForm';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  onFormSubmit: (data: ProductFormData) => void;
  isLoading: boolean;
  categories: Category[];
}

export const EditProductModal = ({
  isOpen,
  onClose,
  productToEdit,
  onFormSubmit,
  isLoading,
  categories,
}: EditProductModalProps) => {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
 
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
        imageUrl: productToEdit.imageUrl || undefined,
        isFeatured: productToEdit.isFeatured ?? false,
      });
    } else {
      form.reset();
    }
  }, [productToEdit, form]);

  const handleInternalSubmit = (data: ProductFormData) => {
    onFormSubmit(data);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Producto" size="xl">
      <ProductForm
        form={form as unknown as UseFormReturn<ProductFormData>}
        onSubmit={handleInternalSubmit}
        isLoading={isLoading}
        categories={categories}
        onImageChange={setSelectedImage}
        currentImageUrl={productToEdit?.imageUrl ?? null}
      />
    </Modal>
  );
};
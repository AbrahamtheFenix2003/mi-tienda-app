'use client';

import React, { useState } from 'react';
import { useForm, type UseFormReturn, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { productSchema, ProductFormData, Category } from '@mi-tienda/types';
import { createProduct, uploadProductImage } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import ProductForm from '@/components/admin/ProductForm';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevoProductoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // 1. Obtener categorías para el <select>
  const { data: categories, isLoading: isLoadingCategories, error: errorCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // 2. Configurar el Formulario con react-hook-form y Zod
  const form = useForm<ProductFormData>({
    // zodResolver puede provenir de una instalación diferente de react-hook-form; casteamos usando unknown+Resolver para mantener tipado.
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormData>,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      acquisitionCost: undefined,
      stock: 0,
      categoryId: undefined,
      isFeatured: false,
    },
  });

  // 3. Mutación para subir la imagen (NUEVA)
  const uploadImageMutation = useMutation({
    mutationFn: ({ productId, imageFile }: { productId: string; imageFile: File }) =>
      uploadProductImage(productId, imageFile),
    onSuccess: (updatedProduct) => {
      console.log('Producto e imagen subidos:', updatedProduct);
      alert(`Producto "${updatedProduct.name}" creado e imagen subida con éxito!`);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/productos');
    },
    onError: (error, variables) => {
      console.error(`Error al subir imagen para producto ${variables?.productId}:`, error);
      alert(
        `Los datos del producto se guardaron, pero la subida de la imagen falló. ${ (error as { message?: string })?.message ?? '' }`
      );
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/productos');
    },
  });

  // 4. Mutación para crear el producto (MODIFICADA)
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (createdProduct) => {
      console.log('Producto creado (datos):', createdProduct);

      if (selectedImageFile) {
        // Si hay imagen, llamamos a la mutación de subida y esperamos
        uploadImageMutation.mutate({
          productId: createdProduct.id,
          imageFile: selectedImageFile,
        });
      } else {
        // Si NO hay imagen, terminamos y redirigimos
        alert(`Producto "${createdProduct.name}" creado con éxito (sin imagen).`);
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        router.push('/productos');
      }
    },
    onError: (error: unknown) => {
      const e = error as { message?: string };
      console.error('Error al crear producto (datos):', e);
      alert(e.message ?? 'No se pudo crear el producto');
    },
  });

  // 5. Función de Envío (MODIFICADA)
  const onSubmit = (data: ProductFormData) => {
    // Solo lanzamos la mutación para crear los datos; la subida de imagen se gestionará en onSuccess
    createProductMutation.mutate(data);
  };

  // 5. Renderizado de Carga de Categorías
  if (isLoadingCategories) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 mr-3 animate-spin text-gray-500" />
        <span className="text-lg text-gray-500">Cargando categorías...</span>
      </div>
    );
  }

  // 6. Renderizado de Error de Categorías
  if (errorCategories) {
    return (
      <div className="flex flex-col items-center py-20 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="h-12 w-12 mb-3" />
        <span className="font-semibold text-lg">Error al cargar datos</span>
        <span className="text-sm mt-1">No se pudieron cargar las categorías para el formulario.</span>
      </div>
    );
  }

  // 7. Renderizado del Formulario (Lógica + UI)
  const isMutating = (createProductMutation.status === 'pending') || (uploadImageMutation.status === 'pending');
  
  return (
    <div className="space-y-6">
      <div>
        <Link href="/productos" className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Productos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Agregar Nuevo Producto</h1>
      </div>
 
      <ProductForm
        form={form as unknown as UseFormReturn<ProductFormData>}
        onSubmit={onSubmit}
        isLoading={isMutating}
        categories={categories || []}
        onImageChange={setSelectedImageFile}
      />
    </div>
  );
}
'use client';

import { useState } from 'react';
import type { Resolver, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { productSchema, ProductFormData, Product } from '@mi-tienda/types';
import { createProduct, uploadProductImage } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import { ProductForm } from '@/components/admin/ProductForm';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevoProductoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Estado local para el archivo de imagen ---
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // --- Query para categorías ---
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  // --- Formulario ---
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      acquisitionCost: undefined,
      stock: 0,
      categoryId: '',
    },
  });

  // --- Mutación para subir la imagen (Paso 2) ---
  const uploadImageMutation = useMutation<Product, unknown, { productId: string; imageFile: File }>({
    mutationFn: ({ productId, imageFile }) => uploadProductImage(productId, imageFile),
    onSuccess: (updatedProduct: Product) => {
      console.log('Producto e imagen subidos:', updatedProduct);
      alert(`Producto "${updatedProduct.name}" creado e imagen subida con éxito!`);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/productos');
    },
    onError: (error: unknown, variables) => {
      const e = error as Error;
      console.error(`Error al subir imagen para producto ${variables?.productId}:`, e);
      alert(`Error: Los datos del producto se guardaron, pero falló la subida de la imagen. ${e.message ?? ''}`);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/productos');
    },
  });

  // --- Mutación para crear el producto (Paso 1) ---
  const createProductMutation = useMutation<Product, unknown, ProductFormData>({
    mutationFn: createProduct,
    onSuccess: (createdProduct: Product) => {
      console.log('Producto creado (datos):', createdProduct);

      if (selectedImageFile) {
        // Si existe imagen, llamar al paso 2
        uploadImageMutation.mutate({
          productId: createdProduct.id,
          imageFile: selectedImageFile,
        });
      } else {
        // No hay imagen: finalizar directamente
        alert(`Producto "${createdProduct.name}" creado con éxito (sin imagen).`);
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        router.push('/productos');
      }
    },
    onError: (error: unknown) => {
      const e = error as Error;
      console.error('Error al crear producto (datos):', e);
      alert(e.message ?? 'No se pudo crear el producto');
    },
  });

  // --- onSubmit del formulario ---
  const onSubmit = (data: ProductFormData) => {
    console.log('Datos del formulario validados:', data);
    createProductMutation.mutate(data);
  };

  const isSubmitting = createProductMutation.status === 'pending' || uploadImageMutation.status === 'pending';

  if (isLoadingCategories) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 mr-3 animate-spin text-gray-500" />
        <span className="text-lg text-gray-500">Cargando categorías...</span>
      </div>
    );
  }

  if (errorCategories) {
    return (
      <div className="flex flex-col items-center py-20 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="h-12 w-12 mb-3" />
        <span className="font-semibold text-lg">Error al cargar datos</span>
        <span className="text-sm mt-1">No se pudieron cargar las categorías para el formulario.</span>
      </div>
    );
  }

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
        isLoading={isSubmitting}
        categories={categories || []}
        onImageChange={setSelectedImageFile}
        currentImageUrl={null}
      />
    </div>
  );
}
'use client';

import { useState } from 'react';
import type { Resolver, UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { productSchema, ProductFormData, Product } from '@mi-tienda/types';
import { createProduct, uploadProductImageByIndex } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import { ProductForm } from '@/components/admin/ProductForm';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevoProductoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- Estado local para el producto recién creado y las imágenes pendientes ---
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  const [pendingImages, setPendingImages] = useState<{ file: File; index: number }[]>([]);

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
      categoryId: '',
    },
  });

  // --- Mutación para subir una imagen por índice (Paso 2) ---
  const uploadImageMutation = useMutation<Product, unknown, { productId: number; imageFile: File; index: number }>({
    mutationFn: ({ productId, imageFile, index }) => uploadProductImageByIndex(productId, imageFile, index),
    onSuccess: (updatedProduct: Product) => {
      console.log(`Imagen ${updatedProduct.name} subida`);
    },
    onError: (error: unknown, variables) => {
      const e = error as Error;
      console.error(`Error al subir imagen ${variables?.index}:`, e);
    },
  });

  // --- Mutación para crear el producto (Paso 1) ---
  const createProductMutation = useMutation<Product, unknown, ProductFormData>({
    mutationFn: createProduct,
    onSuccess: async (createdProduct: Product) => {
      console.log('Producto creado (datos):', createdProduct);
      setCreatedProductId(createdProduct.id);

      // Si hay imágenes pendientes, subirlas ahora
      if (pendingImages.length > 0) {
        try {
          // Subir todas las imágenes pendientes
          await Promise.all(
            pendingImages.map(({ file, index }) =>
              uploadImageMutation.mutateAsync({
                productId: createdProduct.id,
                imageFile: file,
                index,
              })
            )
          );
          alert(`Producto "${createdProduct.name}" creado con imágenes!`);
        } catch (error) {
          console.error('Error al subir algunas imágenes:', error);
          alert(`Producto "${createdProduct.name}" creado, pero algunas imágenes no se subieron.`);
        }
      } else {
        alert(`Producto "${createdProduct.name}" creado con éxito!`);
      }

      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      router.push('/productos');
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

  // --- Handler para cuando se selecciona una imagen ---
  const handleImageChange = (file: File, index: number) => {
    // Agregar imagen a pendientes para subir después de crear el producto
    setPendingImages((prev) => {
      const filtered = prev.filter((img) => img.index !== index);
      return [...filtered, { file, index }];
    });
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
        onImageChange={handleImageChange}
        currentImageUrls={[]}
      />
    </div>
  );
}
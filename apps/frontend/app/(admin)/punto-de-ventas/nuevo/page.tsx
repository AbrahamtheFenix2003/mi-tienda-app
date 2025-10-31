'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSale } from '@/services/salesService';
import { fetchProducts } from '@/services/productService';
import { SaleFormData, saleSchema, Product } from '@mi-tienda/types';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { SaleForm } from '@/components/admin/SaleForm';

interface ErrorResponse {
  message: string;
}

function NuevaVentaPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Configurar formulario con valores por defecto
  const form = useForm<SaleFormData>({
    // resolver: zodResolver(saleSchema), // Desactivado temporalmente por problemas de tipos
    defaultValues: {
      customerName: '',
      customerPhone: '',
      paymentMethod: 'EFECTIVO',
      deliveryMethod: 'OFICINA',
      deliveryCost: 0,
      deliveryLocation: '',
      items: []
    }
  });

  // Query para obtener productos
  const { data: products, isLoading: isLoadingProducts, error: errorProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  });

  // Mutación para crear venta
  const createSaleMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      alert('Venta registrada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['admin-sales'] });
      router.push('/punto-de-ventas');
    },
    onError: (error: AxiosError) => {
      console.error('Error al crear venta:', error);
      const errorMessage = (error.response?.data as ErrorResponse)?.message || 'Ha ocurrido un error al registrar la venta';
      alert(`Error: ${errorMessage}`);
    }
  });

  // Handler de envío del formulario
  const onSubmit = (data: SaleFormData) => {
    createSaleMutation.mutate(data);
  };

  // Manejo de estados de carga y error para productos
  if (isLoadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-600">Cargando productos disponibles...</p>
      </div>
    );
  }

  if (errorProducts) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-red-600">
        <AlertTriangle className="w-8 h-8" />
        <p className="mt-2 font-semibold">Error al cargar productos</p>
        <p className="text-sm text-gray-500">
          {errorProducts instanceof Error ? errorProducts.message : 'Ha ocurrido un error inesperado'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enlace volver al listado */}
      <div className="flex items-center">
        <Link
          href="/punto-de-ventas"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al Listado
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Registrar Nueva Venta</h1>
      </div>

      {/* Formulario - Usando el componente SaleForm */}
      {products && products.length > 0 && (
        <SaleForm
          form={form}
          onSubmit={onSubmit}
          isLoading={createSaleMutation.isPending}
          products={products}
        />
      )}

      {products && products.length === 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos disponibles</h3>
            <p className="text-sm text-gray-500">
              Para registrar una venta, primero debes agregar productos al inventario.
            </p>
            <div className="mt-4">
              <Link
                href="/productos/nuevo"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Agregar Primer Producto
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NuevaVentaPage;
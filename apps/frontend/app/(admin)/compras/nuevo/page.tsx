// apps/frontend/app/(admin)/compras/nuevo/page.tsx

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Resolver, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPurchase, fetchPurchases } from '../../../../services/purchaseService';
import { fetchSuppliers } from '../../../../services/supplierService';
import { fetchProducts } from '../../../../services/productService';
import { PurchaseFormData, purchaseSchema } from '@mi-tienda/types';
import { Supplier } from '@mi-tienda/types';
import { Product } from '@mi-tienda/types';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NewPurchaseForm } from '../../../../components/admin/NewPurchaseForm';
import { useInvalidateQueries, QUERY_KEYS } from '../../../../utils/queryInvalidation';

const NuevaCompraPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { invalidateAfterPurchase } = useInvalidateQueries();

  // Configuración del formulario
  const form = useForm<PurchaseFormData>({
    resolver: zodResolver(purchaseSchema) as Resolver<PurchaseFormData>,
    defaultValues: {
      purchaseDate: new Date(),
      supplierId: 0,
      paymentMethod: undefined,
      notes: '',
      items: []
    }
  });

  // Query para obtener proveedores
  const { data: suppliers, isLoading: isLoadingSuppliers, error: errorSuppliers } = useQuery<Supplier[]>({
    queryKey: QUERY_KEYS.SUPPLIERS,
    queryFn: fetchSuppliers,
  });

  // Query para obtener productos
  const { data: products, isLoading: isLoadingProducts, error: errorProducts } = useQuery<Product[]>({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: fetchProducts,
  });

  // Mutación para crear compra
  const createPurchaseMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: (data) => {
      console.log('Compra creada exitosamente:', data);
      // Mostrar alerta de éxito
      alert('¡Compra registrada exitosamente!');
      // Invalidar todas las queries relacionadas con compras
      // Esto actualizará: compras, productos (stock), caja, dashboard
      invalidateAfterPurchase();
      // Redirigir al listado
      router.push('/compras');
    },
    onError: (error: Error) => {
      console.error('Error al crear compra:', error);
      alert(`Error al crear la compra: ${error.message || 'Error desconocido'}`);
    }
  });

  // Handler para submit
  const onSubmit = (data: PurchaseFormData) => {
    createPurchaseMutation.mutate(data);
  };

  // Manejo de estados de carga
  if (isLoadingSuppliers || isLoadingProducts) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos para el formulario...</p>
        </div>
      </div>
    );
  }

  // Manejo de errores
  if (errorSuppliers || errorProducts) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            Error al cargar los datos para el formulario.
          </p>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPLIERS });
              queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PRODUCTS });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Renderizado del formulario cuando los datos están listos
  if (suppliers && products) {
    return (
      <div className="space-y-6">
        {/* Enlace para volver */}
        <div>
          <Link 
            href="/compras" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Listado
          </Link>
        </div>

        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registrar Nueva Compra
          </h1>
          <p className="text-gray-600 mt-2">
            Complete la información para registrar una nueva compra
          </p>
        </div>

        {/* Componente PurchaseForm */}
        <NewPurchaseForm
          form={form}
          onSubmit={onSubmit}
          isLoading={createPurchaseMutation.isPending}
          suppliers={suppliers}
          products={products}
        />
      </div>
    );
  }

  return null;
};

export default NuevaCompraPage;
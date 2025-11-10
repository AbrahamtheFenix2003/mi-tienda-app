// apps/frontend/app/(admin)/compras/editar/[id]/page.tsx

'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Resolver, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePurchase } from '../../../../../services/purchaseService';
import { fetchSuppliers } from '../../../../../services/supplierService';
import { fetchProducts } from '../../../../../services/productService';
import { PurchaseFormData, purchaseSchema } from '@mi-tienda/types';
import { Supplier } from '@mi-tienda/types';
import { Product } from '@mi-tienda/types';
import { Purchase } from '@mi-tienda/types';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PurchaseForm } from '../../../../../components/admin/PurchaseForm';
import api from '../../../../../services/api';

// Tipos para manejo de errores
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// Fetch individual purchase
const fetchPurchaseById = async (id: string): Promise<Purchase> => {
  try {
    const response = await api.get<Purchase>(`/purchases/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchase ${id}:`, error);
    throw error;
  }
};

// Helper para convertir Purchase de la API a PurchaseFormData
const mapPurchaseToFormData = (purchase: Purchase): PurchaseFormData => {
  return {
    purchaseDate: new Date(purchase.purchaseDate),
    supplierId: purchase.supplierId,
    paymentMethod: purchase.paymentMethod,
    notes: purchase.notes || '',
    items: purchase.items.map(item => ({
      productId: item.product?.id || 0,
      quantity: item.quantity,
      purchasePrice: parseFloat(item.purchasePrice), // Convertir string a number
      fechaVencimiento: item.fechaVencimiento ? new Date(item.fechaVencimiento) : null,
      loteId: item.loteId || ''
    }))
  };
};

const EditarCompraPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const purchaseId = params.id as string;

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

  // Query para obtener la compra específica
  const { data: purchase, isLoading: isLoadingPurchase, error: errorPurchase } = useQuery<Purchase>({
    queryKey: ['admin-purchase', purchaseId],
    queryFn: () => fetchPurchaseById(purchaseId),
    enabled: !!purchaseId
  });

  // Query para obtener proveedores
  const { data: suppliers, isLoading: isLoadingSuppliers, error: errorSuppliers } = useQuery<Supplier[]>({
    queryKey: ['admin-suppliers'],
    queryFn: fetchSuppliers,
  });

  // Query para obtener productos
  const { data: products, isLoading: isLoadingProducts, error: errorProducts } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  });

  // Mutación para actualizar compra
  const updatePurchaseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PurchaseFormData }) => updatePurchase(id, data),
    onSuccess: (data) => {
      console.log('Compra actualizada exitosamente:', data);
      // Mostrar alerta de éxito
      alert('¡Compra actualizada exitosamente!');
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['admin-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['admin-purchase', purchaseId] });
      // Redirigir al listado
      router.push('/compras');
    },
    onError: (error: ApiError) => {
      console.error('Error al actualizar compra:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al actualizar la compra: ${errorMessage}`);
    }
  });

  // Handler para submit
  const onSubmit = (data: PurchaseFormData) => {
    updatePurchaseMutation.mutate({ id: purchaseId, data });
  };

  // Efecto para llenar el formulario cuando se cargan los datos de la compra
  React.useEffect(() => {
    if (purchase) {
      form.reset(mapPurchaseToFormData(purchase));
    }
  }, [purchase, form]);

  // Estados de carga
  const isLoadingData = isLoadingPurchase || isLoadingSuppliers || isLoadingProducts;

  // Manejo de estados de carga
  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos de la compra...</p>
        </div>
      </div>
    );
  }

  // Manejo de errores
  if (errorPurchase || errorSuppliers || errorProducts) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            Error al cargar los datos de la compra.
          </p>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-purchase', purchaseId] });
              queryClient.invalidateQueries({ queryKey: ['admin-suppliers'] });
              queryClient.invalidateQueries({ queryKey: ['admin-products'] });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Verificar que tenemos todos los datos necesarios
  if (!purchase || !suppliers || !products) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <p className="text-gray-600">No se pudieron cargar los datos necesarios.</p>
        </div>
      </div>
    );
  }

  // Renderizado del formulario cuando los datos están listos
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
          Editar Compra #{purchase.invoiceNumber || purchase.id}
        </h1>
        <p className="text-gray-600 mt-2">
          Modifique la información de la compra según sea necesario
        </p>
      </div>

      {/* Componente PurchaseForm */}
      <PurchaseForm
        form={form}
        onSubmit={onSubmit}
        isLoading={updatePurchaseMutation.isPending}
        suppliers={suppliers}
        products={products}
        isEditMode={true}
      />
    </div>
  );
};

export default EditarCompraPage;
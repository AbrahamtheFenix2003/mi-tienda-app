// apps/frontend/app/(admin)/compras/page.tsx

'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPurchases } from '../../../services/purchaseService';
import { Purchase } from '@mi-tienda/types';
import {
  Loader2,
  AlertTriangle,
  PlusCircle,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';
import { PurchaseTable } from '../../../components/admin/PurchaseTable';

const ComprasPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Obtener datos de compras
  const { data: purchases, isLoading, error } = useQuery<Purchase[]>({
    queryKey: ['admin-purchases'],
    queryFn: fetchPurchases,
  });

  // Funciones de manejo para las acciones de la tabla
  const handleViewDetails = (purchase: Purchase) => {
    console.log('Ver detalles de compra:', purchase);
    // TODO: Implementar modal o página de detalles
  };

  const handleAnnul = (purchase: Purchase) => {
    console.log('Anular compra:', purchase);
    // TODO: Implementar lógica de anulación
  };

  // Función para renderizar el contenido principal
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando compras...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center py-12">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <span className="ml-2 text-red-600">
            Error al cargar las compras. Intenta nuevamente.
          </span>
        </div>
      );
    }

    if (purchases && purchases.length > 0) {
      return (
        <div className="space-y-6">
          <PurchaseTable
            purchases={purchases}
            onViewDetails={handleViewDetails}
            onAnnul={handleAnnul}
          />
        </div>
      );
    }

    // No hay compras registradas
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay compras registradas
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza registrando tu primera compra
          </p>
          <Link
            href="/compras/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Registrar primera compra
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <ShoppingCart className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            Registro de Compras
          </h1>
        </div>
        
        <Link
          href="/compras/nuevo"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Registrar Nueva Compra
        </Link>
      </div>

      {/* Contenido principal */}
      {renderContent()}
    </div>
  );
};

export default ComprasPage;
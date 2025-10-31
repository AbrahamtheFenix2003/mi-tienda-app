'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, AlertTriangle, PlusCircle, ShoppingCart } from 'lucide-react';
import { fetchSales } from '@/services/salesService';
import { Sale } from '@mi-tienda/types';
import { SalesTable } from '@/components/admin/SalesTable';

function PuntoDeVentaPage() {
  // Obtener el cliente de Query
  const queryClient = useQueryClient();

  // Obtener las ventas usando useQuery
  const { data: sales, isLoading, error } = useQuery({
    queryKey: ['admin-sales'],
    queryFn: fetchSales,
  });

  // Funciones para las acciones (placeholder por ahora)
  const handleViewDetails = (sale: Sale) => {
    console.log('Ver detalles de venta:', sale.id);
    // Aquí se implementará la lógica para ver detalles
  };

  const handleAnnul = (sale: Sale) => {
    console.log('Anular venta:', sale.id);
    // Aquí se implementará la lógica para anular
  };

  // Función para renderizar el contenido principal
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando ventas...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-red-600">
          <AlertTriangle className="w-8 h-8" />
          <p className="mt-2 font-semibold">Error al cargar las ventas</p>
          <p className="text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Ha ocurrido un error inesperado'}
          </p>
        </div>
      );
    }

    if (sales && sales.length > 0) {
      // Mostrar la tabla real de ventas
      return (
        <SalesTable 
          sales={sales} 
          onViewDetails={handleViewDetails}
          onAnnul={handleAnnul}
        />
      );
    }

    // Estado vacío: no hay ventas
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <ShoppingCart className="w-12 h-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ventas registradas</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza registrando tu primera venta.</p>
        <div className="mt-6">
          <Link
            href="/punto-de-ventas/nuevo"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Registrar primera venta
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <ShoppingCart className="w-6 h-6 mr-2 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Listado de Ventas</h1>
        </div>
        <Link
          href="/punto-de-ventas/nuevo"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Registrar Nueva Venta
        </Link>
      </div>

      {/* Contenido principal */}
      {renderContent()}
    </div>
  );
}

export default PuntoDeVentaPage;
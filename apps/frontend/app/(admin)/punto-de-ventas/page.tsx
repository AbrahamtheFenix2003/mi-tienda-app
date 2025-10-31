'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Loader2, AlertTriangle, PlusCircle, ShoppingCart } from 'lucide-react';
import { fetchSales, annulSale } from '@/services/salesService';
import { Sale } from '@mi-tienda/types';
import { SalesTable } from '@/components/admin/SalesTable';
import { AnnulSaleModal } from '@/components/admin/AnnulSaleModal';

function PuntoDeVentaPage() {
  // Obtener el cliente de Query
  const queryClient = useQueryClient();

  // Estados para el modal de anulación
  const [isAnnulModalOpen, setIsAnnulModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Obtener las ventas usando useQuery
  const { data: sales, isLoading, error } = useQuery({
    queryKey: ['admin-sales'],
    queryFn: fetchSales,
  });

  // Mutación para anular una venta
  const annulMutation = useMutation({
    mutationFn: annulSale,
    onSuccess: () => {
      alert('Venta anulada correctamente.');
      queryClient.invalidateQueries({ queryKey: ['admin-sales'] });
      handleCloseAnnulModal();
    },
    onError: (error: unknown) => {
      console.error('Error al anular la venta:', error);
      // Mostrar el error de negocio del backend (ej: "ya ha sido anulada")
      let errorMessage = 'Error al anular la venta.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as { response?: { data?: { message?: string } } };
        errorMessage = errorObj.response?.data?.message || errorMessage;
      }
      alert(errorMessage);
    },
  });

  // Funciones para las acciones
  const handleViewDetails = (sale: Sale) => {
    console.log('Ver detalles de venta:', sale.id);
    // Aquí se implementará la lógica para ver detalles
  };

  const handleAnnul = (sale: Sale) => {
    setSelectedSale(sale);
    setIsAnnulModalOpen(true);
  };

  // Handlers para el modal de anulación
  const handleCloseAnnulModal = () => {
    setSelectedSale(null);
    setIsAnnulModalOpen(false);
  };

  const handleConfirmAnnul = () => {
    if (selectedSale) {
      annulMutation.mutate(selectedSale.id);
    }
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

      {/* Modal de anulación de venta */}
      <AnnulSaleModal
        isOpen={isAnnulModalOpen}
        onClose={handleCloseAnnulModal}
        onConfirm={handleConfirmAnnul}
        isLoading={annulMutation.isPending}
        saleIdentifier={selectedSale?.customerName || selectedSale?.id}
      />
    </div>
  );
}

export default PuntoDeVentaPage;
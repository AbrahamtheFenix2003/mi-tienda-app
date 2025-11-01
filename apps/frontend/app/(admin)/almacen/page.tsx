'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle, Warehouse, Boxes, History } from 'lucide-react';
import { fetchStockLots, fetchStockMovements } from '@/services/inventoryService';
import { StockLot, StockMovement } from '@mi-tienda/types';
import { StockLotsTable } from '@/components/admin/StockLotsTable';
import StockMovementsTable from '@/components/admin/StockMovementsTable';

function AlmacenPage() {
  const [activeTab, setActiveTab] = useState<'lotes' | 'movimientos'>('lotes');

  // Query de Lotes
  const { 
    data: lotsData, 
    isLoading: isLoadingLots, 
    error: errorLots 
  } = useQuery({
    queryKey: ['admin-stock-lots'],
    queryFn: fetchStockLots,
  });

  // Query de Movimientos
  const { 
    data: movementsData, 
    isLoading: isLoadingMovements, 
    error: errorMovements 
  } = useQuery({
    queryKey: ['admin-stock-movements'],
    queryFn: fetchStockMovements,
  });

  // Contenido de la pestaña "Lotes"
  const renderLotsContent = () => {
    if (isLoadingLots) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando lotes de stock...</p>
        </div>
      );
    }

    if (errorLots) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-red-600">
          <AlertTriangle className="w-8 h-8" />
          <p className="mt-2 font-semibold">Error al cargar los lotes</p>
          <p className="text-sm text-gray-500">
            {errorLots instanceof Error ? errorLots.message : 'Ha ocurrido un error inesperado'}
          </p>
        </div>
      );
    }

    if (lotsData && lotsData.length > 0) {
      return (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <Boxes className="inline w-4 h-4 mr-1" />
              Mostrando {lotsData.length} lote(s) de stock
            </p>
          </div>
          <StockLotsTable lots={lotsData} />
        </div>
      );
    }

    // Estado vacío: no hay lotes
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Boxes className="w-12 h-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay lotes de stock</h3>
        <p className="mt-1 text-sm text-gray-500">Los lotes se crearán automáticamente al registrar compras.</p>
      </div>
    );
  };

  // Contenido de la pestaña "Movimientos"
  const renderMovementsContent = () => {
    if (isLoadingMovements) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando movimientos de stock...</p>
        </div>
      );
    }

    if (errorMovements) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-red-600">
          <AlertTriangle className="w-8 h-8" />
          <p className="mt-2 font-semibold">Error al cargar los movimientos</p>
          <p className="text-sm text-gray-500">
            {errorMovements instanceof Error ? errorMovements.message : 'Ha ocurrido un error inesperado'}
          </p>
        </div>
      );
    }

    if (movementsData && movementsData.length > 0) {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <History className="inline w-4 h-4 mr-1" />
              Mostrando {movementsData.length} movimiento(s) de stock
            </p>
          </div>
          <StockMovementsTable movements={movementsData} />
        </div>
      );
    }

    // Estado vacío: no hay movimientos
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <History className="w-12 h-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay movimientos de stock</h3>
        <p className="mt-1 text-sm text-gray-500">Los movimientos se generarán automáticamente con las ventas y compras.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}
      <div className="flex items-center">
        <Warehouse className="w-6 h-6 mr-2 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Almacén</h1>
      </div>

      {/* Controles de Pestañas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('lotes')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'lotes'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Boxes className="w-4 h-4 mr-2" />
            Lotes de Stock
          </button>
          <button
            onClick={() => setActiveTab('movimientos')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'movimientos'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History className="w-4 h-4 mr-2" />
            Historial de Movimientos
          </button>
        </nav>
      </div>

      {/* Contenido de Pestañas */}
      <div className="mt-6">
        {activeTab === 'lotes' && renderLotsContent()}
        {activeTab === 'movimientos' && renderMovementsContent()}
      </div>
    </div>
  );
}

export default AlmacenPage;
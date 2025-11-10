'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle, Warehouse, Boxes, History, PackageSearch } from 'lucide-react';
import { fetchStockLots, fetchStockMovements } from '@/services/inventoryService';
import { fetchProducts } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import { StockLot, StockMovement, Product } from '@mi-tienda/types';
import { StockLotsTable } from '@/components/admin/StockLotsTable';
import StockMovementsTable from '@/components/admin/StockMovementsTable';
import { InventoryTable } from '@/components/admin/InventoryTable';
import { InventoryFilters } from '@/components/admin/InventoryFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProductDetailsModal } from '@/components/admin/ProductDetailsModal';

function AlmacenPage() {
  const [activeTab, setActiveTab] = useState<'resumen' | 'lotes' | 'movimientos'>('resumen');
  
  // Estados para filtros y ordenamiento
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [stockFilter, setStockFilter] = useState<string>('all');
  
  // Estado para modal de detalles
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Query de Lotes
  const { 
    data: lotsData, 
    isLoading: isLoadingLots, 
    error: errorLots 
  } = useQuery<StockLot[]>({
    queryKey: ['admin-stock-lots'],
    queryFn: fetchStockLots,
  });

  // Query de Movimientos
  const { 
    data: movementsData, 
    isLoading: isLoadingMovements, 
    error: errorMovements 
  } = useQuery<StockMovement[]>({
    queryKey: ['admin-stock-movements'],
    queryFn: fetchStockMovements,
  });

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useQuery<Product[]>({
    queryKey: ['admin-products-inventory'],
    queryFn: fetchProducts,
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Filtrar y ordenar productos
  const filteredAndSortedProducts = useMemo(() => {
    if (!productsData) return [];
    
    let result = [...productsData];
    
    // Aplicar filtro de búsqueda
    if (searchFilter.trim() !== '') {
      const searchLower = searchFilter.toLowerCase().trim();
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.code.toLowerCase().includes(searchLower) ||
        (product.category?.name && product.category.name.toLowerCase().includes(searchLower))
      );
    }
    
    // Aplicar filtro por categoría
    if (categoryFilter !== null) {
      result = result.filter(product => product.categoryId === categoryFilter);
    }
    
    // Aplicar filtro por stock
    if (stockFilter !== 'all') {
      result = result.filter(product => {
        const stock = product.stock || 0;
        switch (stockFilter) {
          case 'available':
            return stock > 0;
          case 'low':
            return stock > 0 && stock < 10;
          case 'out':
            return stock === 0;
          default:
            return true;
        }
      });
    }
    
    // Aplicar ordenamiento
    result.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category?.name.toLowerCase() || '';
          bValue = b.category?.name.toLowerCase() || '';
          break;
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'totalValue':
          aValue = parseFloat(a.price) * (a.stock || 0);
          bValue = parseFloat(b.price) * (b.stock || 0);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return result;
  }, [productsData, categoryFilter, sortBy, sortOrder, searchFilter, stockFilter]);

  const renderSummaryContent = () => {
    if (isLoadingProducts || isLoadingCategories) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="mt-2 text-gray-600">Cargando resumen de inventario...</p>
        </div>
      );
    }

    if (errorProducts) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-red-600">
          <AlertTriangle className="w-8 h-8" />
          <p className="mt-2 font-semibold">Error al cargar los productos</p>
          <p className="text-sm text-gray-500">
            {errorProducts instanceof Error ? errorProducts.message : 'Ha ocurrido un error inesperado'}
          </p>
        </div>
      );
    }

    if (!productsData || productsData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <PackageSearch className="w-12 h-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos registrados</h3>
          <p className="mt-1 text-sm text-gray-500">
            Crea productos desde la sección de Productos para ver su inventario aquí.
          </p>
        </div>
      );
    }

    const totalProducts = productsData.length;
    const totalStock = productsData.reduce((acc, product) => acc + (product.stock ?? 0), 0);
    const totalValue = productsData.reduce((acc, product) => {
      const unitCost = product.acquisitionCost ? parseFloat(product.acquisitionCost) : parseFloat(product.price);
      return acc + (unitCost * (product.stock ?? 0));
    }, 0);

    return (
      <div className="space-y-6">
        {/* Tarjetas de resumen */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Total de Productos</CardTitle>
              <Boxes className="w-6 h-6 text-rose-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-900">{totalProducts}</p>
              <p className="mt-1 text-sm text-gray-500">Productos activos en el catálogo</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Unidades en Inventario</CardTitle>
              <Warehouse className="w-6 h-6 text-rose-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-900">{totalStock}</p>
              <p className="mt-1 text-sm text-gray-500">Suma de stock disponible</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Valor Total del Inventario</CardTitle>
              <Warehouse className="w-6 h-6 text-green-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-900">
                S/ {isNaN(totalValue) ? '0.00' : totalValue.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-gray-500">Valor total del stock actual</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y tabla */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalle por producto</h2>
          <InventoryFilters
            onSortChange={(newSortBy, newSortOrder) => {
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            onCategoryFilter={(categoryId) => setCategoryFilter(categoryId)}
            onSearchFilter={(searchTerm) => setSearchFilter(searchTerm)}
            onStockFilter={(stockFilterValue) => setStockFilter(stockFilterValue)}
            categories={categoriesData || []}
          />
          <InventoryTable
            products={filteredAndSortedProducts}
            onView={handleViewDetails}
          />
        </div>
      </div>
    );
  };

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

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
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
            onClick={() => setActiveTab('resumen')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resumen'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <PackageSearch className="w-4 h-4 mr-2" />
            Resumen de Inventario
          </button>
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
        {activeTab === 'resumen' && renderSummaryContent()}
        {activeTab === 'lotes' && renderLotsContent()}
        {activeTab === 'movimientos' && renderMovementsContent()}
      </div>

      {/* Modal de detalles del producto */}
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        stockLots={[]}
        isLoading={false}
      />
    </div>
  );
}

export default AlmacenPage;

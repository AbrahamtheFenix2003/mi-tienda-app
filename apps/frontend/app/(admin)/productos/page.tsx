'use client'; // Necesario para usar hooks en esta página

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, updateProduct, deleteProduct, uploadProductImageByIndex, deleteProductImageByIndex, getProductStockLots } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import { ProductTable } from '@/components/admin/ProductTable';
import { EditProductModal } from '@/components/admin/EditProductModal';
import { DeleteProductModal } from '@/components/admin/DeleteProductModal';
import { ProductDetailsModal } from '@/components/admin/ProductDetailsModal';
import { ProductFilters } from '@/components/admin/ProductFilters';
import { Loader2, AlertTriangle, PackagePlus } from 'lucide-react';
import Link from 'next/link';
import { Product, ProductFormData, StockLot } from '@mi-tienda/types';
import { useInvalidateQueries, QUERY_KEYS } from '@/utils/queryInvalidation';

/**
* Página de administración: Lista de productos
* Usa react-query para obtener datos y delega la UI a ProductTable.
*/
export default function ProductosPage() {
  const queryClient = useQueryClient();
  const { invalidateAfterProductChange } = useInvalidateQueries();

  // Estados para modales y producto seleccionado
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [stockLots, setStockLots] = useState<StockLot[]>([]);
  const [isLoadingLots, setIsLoadingLots] = useState(false);
  
  // Estados para filtros y ordenamiento
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Queries
  const { data: products, isLoading: isLoadingProducts, error: errorProducts } = useQuery({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: fetchProducts,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: fetchCategories,
  });

  // Filtrar y ordenar productos
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    
    let result = [...products];
    
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
  }, [products, categoryFilter, sortBy, sortOrder, searchFilter]);

  // Mutación para subir una imagen individual por índice
  const uploadImageByIndexMutation = useMutation<Product, unknown, { productId: number; imageFile: File; index: number }>({
    mutationFn: ({ productId, imageFile, index }) => uploadProductImageByIndex(productId, imageFile, index),
    onSuccess: (updatedProduct: Product) => {
      // Actualizar el producto seleccionado con los nuevos datos
      setSelectedProduct(updatedProduct);
      // Invalidar queries relacionadas con productos
      invalidateAfterProductChange();
      // Removido el alert para mejor UX
    },
    onError: (error: unknown, variables) => {
      const e = error as Error;
      console.error(`Error al subir imagen ${variables?.index} para producto ${variables?.productId}:`, e);
      alert(`Error al subir la imagen: ${e.message ?? 'Error desconocido'}`);
    },
  });

  // Mutación para eliminar una imagen individual por índice
  const deleteImageByIndexMutation = useMutation<Product, unknown, { productId: number; index: number }>({
    mutationFn: ({ productId, index }) => deleteProductImageByIndex(productId, index),
    onSuccess: (updatedProduct: Product) => {
      // Actualizar el producto seleccionado con los nuevos datos
      setSelectedProduct(updatedProduct);
      // Invalidar queries relacionadas con productos
      invalidateAfterProductChange();
      // Removido el alert para mejor UX
    },
    onError: (error: unknown, variables) => {
      const e = error as Error;
      console.error(`Error al eliminar imagen ${variables?.index} para producto ${variables?.productId}:`, e);
      alert(`Error al eliminar la imagen: ${e.message ?? 'Error desconocido'}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductFormData> }) => updateProduct(id, data),
    onSuccess: (updatedProduct: Product) => {
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      // Invalidar queries relacionadas con productos
      invalidateAfterProductChange();
      alert(`Producto "${updatedProduct.name}" actualizado.`);
    },
    onError: (error: unknown) => {
      const e = error as Error & { fieldErrors?: Record<string, string>; message?: string };
      console.error('Error al actualizar:', e);

      // Si hay errores por campo, mostrarlos en el formulario del modal
      if (e.fieldErrors && Object.keys(e.fieldErrors).length > 0) {
        setEditErrors(e.fieldErrors);
      } else {
        alert(e.message ?? 'Error al actualizar producto');
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      // Invalidar queries relacionadas con productos
      invalidateAfterProductChange();
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      alert('Producto eliminado.');
    },
    onError: (error: unknown) => {
      const e = error as { message?: string };
      console.error('Error al eliminar:', e);
      alert(e.message ?? 'Error al eliminar producto');
    },
  });

  const renderContent = () => {
    if (isLoadingProducts || isLoadingCategories) {
      return (
        <div className="flex justify-center items-center py-20 text-gray-500">
          <Loader2 className="h-10 w-10 mr-3 animate-spin" />
          <span className="text-lg">Cargando productos...</span>
        </div>
      );
    }

    if (errorProducts) {
      return (
        <div className="flex flex-col items-center py-20 text-red-600 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-12 w-12 mb-3" />
          <span className="font-semibold text-lg">Error al cargar productos</span>
          <span className="text-sm mt-1">{errorProducts instanceof Error ? errorProducts.message : String(errorProducts)}</span>
        </div>
      );
    }

    if (products) {
      if (products.length === 0) {
        return (
          <div className="text-center py-20 bg-white rounded-lg shadow border">
            <h3 className="text-xl font-semibold text-gray-800">No hay productos</h3>
            <p className="text-gray-500 mt-2 mb-4">Aún no has creado ningún producto.</p>
            <Link href="/productos/nuevo" className="flex items-center justify-center mx-auto px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600">
              <PackagePlus className="h-5 w-5 mr-2" />
              Crear primer producto
            </Link>
          </div>
        );
      }

      return (
        <>
          <ProductFilters
            onSortChange={(newSortBy, newSortOrder) => {
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            onCategoryFilter={(categoryId) => setCategoryFilter(categoryId)}
            onSearchFilter={(searchTerm) => setSearchFilter(searchTerm)}
            categories={categories || []}
          />
          <ProductTable
            products={filteredAndSortedProducts}
            onView={handleViewDetails}
            onEdit={(p: Product) => { setSelectedProduct(p); setIsEditModalOpen(true); }}
            onDelete={(p: Product) => { setSelectedProduct(p); setIsDeleteModalOpen(true); }}
          />
        </>
      );
    }

    return null;
  };

 const handleUpdateSubmit = (data: ProductFormData) => {
   if (!selectedProduct) return;
   updateMutation.mutate({ id: selectedProduct.id, data });
 };

 const handleConfirmDelete = () => {
   if (!selectedProduct) return;
   deleteMutation.mutate(selectedProduct.id);
 };

 const handleImageChange = (file: File, index: number) => {
   if (!selectedProduct) return;
   // Subir inmediatamente la imagen cuando se selecciona
   uploadImageByIndexMutation.mutate({ productId: selectedProduct.id, imageFile: file, index });
 };

 const handleImageDelete = (index: number) => {
   if (!selectedProduct) return;
   // Eliminar inmediatamente la imagen cuando se hace clic en el botón X
   deleteImageByIndexMutation.mutate({ productId: selectedProduct.id, index });
 };

 const handleViewDetails = async (product: Product) => {
   setSelectedProduct(product);
   setIsDetailsModalOpen(true);
   setIsLoadingLots(true);
   try {
     const lots = await getProductStockLots(product.id);
     setStockLots(lots);
   } catch (error) {
     console.error('Error fetching stock lots:', error);
     setStockLots([]);
   } finally {
     setIsLoadingLots(false);
   }
 };

 return (
   <div className="space-y-6">
     <div className="flex justify-between items-center">
       <div>
         <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
         <p className="mt-1 text-gray-600">Aquí podrás crear, editar y eliminar tus productos.</p>
       </div>
       <Link href="/productos/nuevo" className="flex items-center px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 shadow-sm transition-colors">
         <PackagePlus className="h-5 w-5 mr-2" />
         Agregar Producto
       </Link>
     </div>

     <div className="mt-6">{renderContent()}</div>

     {/* Modales */}
     <EditProductModal
       isOpen={isEditModalOpen}
       onClose={() => {
         setIsEditModalOpen(false);
         setSelectedProduct(null);
         setEditErrors({});
       }}
       productToEdit={selectedProduct}
       onFormSubmit={handleUpdateSubmit}
       isLoading={updateMutation.isPending}
       categories={categories || []}
       onImageChange={handleImageChange}
       onImageDelete={handleImageDelete}
       serverErrors={editErrors}
       allProducts={products || []}
     />

     <DeleteProductModal
       isOpen={isDeleteModalOpen}
       onClose={() => { setIsDeleteModalOpen(false); setSelectedProduct(null); }}
       onConfirm={handleConfirmDelete}
       isLoading={deleteMutation.isPending}
       productName={selectedProduct?.name}
     />

     <ProductDetailsModal
       isOpen={isDetailsModalOpen}
       onClose={() => {
         setIsDetailsModalOpen(false);
         setSelectedProduct(null);
         setStockLots([]);
       }}
       product={selectedProduct}
       stockLots={stockLots}
       isLoading={isLoadingLots}
     />
   </div>
 );
}
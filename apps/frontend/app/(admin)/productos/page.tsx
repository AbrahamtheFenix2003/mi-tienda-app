'use client'; // Necesario para usar hooks en esta página

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, updateProduct, deleteProduct, uploadProductImage } from '@/services/productService';
import { fetchCategories } from '@/services/categoryService';
import { ProductTable } from '@/components/admin/ProductTable';
import { EditProductModal } from '@/components/admin/EditProductModal';
import { DeleteProductModal } from '@/components/admin/DeleteProductModal';
import { Loader2, AlertTriangle, PackagePlus } from 'lucide-react';
import Link from 'next/link';
import { Product, ProductFormData } from '@mi-tienda/types';

/**
* Página de administración: Lista de productos
* Usa react-query para obtener datos y delega la UI a ProductTable.
*/
export default function ProductosPage() {
  const queryClient = useQueryClient();

  // Estados para modales y producto seleccionado
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  // Queries
  const { data: products, isLoading: isLoadingProducts, error: errorProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Mutaciones
  const uploadEditImageMutation = useMutation<Product, unknown, { productId: string; imageFile: File }>({
    mutationFn: ({ productId, imageFile }) => uploadProductImage(productId, imageFile),
    onSuccess: (updatedProduct: Product) => {
      // Cerrar modal y limpiar estado tras subir la imagen de edición
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setEditImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      alert(`Producto "${updatedProduct.name}" actualizado y imagen subida con éxito.`);
    },
    onError: (error: unknown, variables) => {
      const e = error as Error;
      console.error(`Error al subir imagen para producto ${variables?.productId}:`, e);
      alert(`Error: Los datos del producto se actualizaron, pero falló la subida de la imagen. ${e.message ?? ''}`);
      // Aseguramos limpieza e invalidación aunque la imagen haya fallado
      setIsEditModalOpen(false);
      setSelectedProduct(null);
      setEditImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) => updateProduct(id, data),
    onSuccess: (updatedProduct: Product) => {
      // NO cerrar modal ni invalidar la query aquí inmediatamente.
      if (editImageFile) {
        // Si hay fichero seleccionado, subimos la imagen vinculada al producto ya actualizado
        uploadEditImageMutation.mutate({ productId: updatedProduct.id, imageFile: editImageFile });
      } else {
        // Si no hay imagen que subir, cerramos e invalidamos
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        alert(`Producto "${updatedProduct.name}" actualizado.`);
      }
    },
    onError: (error: unknown) => {
      const e = error as { message?: string };
      console.error('Error al actualizar:', e);
      alert(e.message ?? 'Error al actualizar producto');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
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

      return <ProductTable products={products} onEdit={(p: Product) => { setSelectedProduct(p); setIsEditModalOpen(true); }} onDelete={(p: Product) => { setSelectedProduct(p); setIsDeleteModalOpen(true); }} />;
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
       onClose={() => { setIsEditModalOpen(false); setSelectedProduct(null); setEditImageFile(null); }}
       productToEdit={selectedProduct}
       onFormSubmit={handleUpdateSubmit}
       isLoading={updateMutation.isPending}
       categories={categories || []}
       onImageChange={setEditImageFile}
     />

     <DeleteProductModal
       isOpen={isDeleteModalOpen}
       onClose={() => { setIsDeleteModalOpen(false); setSelectedProduct(null); }}
       onConfirm={handleConfirmDelete}
       isLoading={deleteMutation.isPending}
       productName={selectedProduct?.name}
     />
   </div>
 );
}
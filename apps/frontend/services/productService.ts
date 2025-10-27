// services/productService.ts

import api from './api';
import { Product, ProductFormData } from '@mi-tienda/types';

/**
 * Obtiene todos los productos desde la API.
 * @returns Promise<Product[]>
 */
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>('/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Lanza el error para que react-query pueda manejarlo
    throw error;
  }
};

/**
 * (NUEVO) Crea un nuevo producto.
 * @param data - Los datos del producto validados por Zod.
 * @returns El producto recién creado.
 */
export const createProduct = async (data: ProductFormData): Promise<Product> => {
  try {
    // El token se adjunta automáticamente gracias a 'setAuthToken' en useAuth.tsx
    const response = await api.post<Product>('/products', data);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * (NUEVO) Actualiza un producto existente.
 * @param id - El ID del producto a actualizar.
 * @param data - Los datos parciales del producto a actualizar (validados por Zod).
 * @returns El producto actualizado.
 */
export const updateProduct = async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
  try {
    // El token se adjunta automáticamente
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

/**
 * (NUEVO) Elimina un producto.
 * @param id - El ID del producto a eliminar.
 * @returns Una promesa que se resuelve cuando la eliminación es exitosa.
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    // El token se adjunta automáticamente
    await api.delete(`/products/${id}`);
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

/**
 * (NUEVO) Sube la imagen principal para un producto.
 * @param productId - El ID del producto.
 * @param imageFile - El archivo de imagen (objeto File).
 * @returns El producto actualizado con la nueva URL de imagen.
 */
export const uploadProductImage = async (productId: string, imageFile: File): Promise<Product> => {
  // 1. Crear FormData
  const formData = new FormData();
  formData.append('image', imageFile); // La clave 'image' debe coincidir con upload.single('image')

  try {
    // 2. Hacer la petición POST, especificando el Content-Type
    const response = await api.post<Product>(
      `/products/${productId}/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error uploading image for product ${productId}:`, error);
    throw error;
  }
};

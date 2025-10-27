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
export const updateProduct = async (id: number, data: Partial<ProductFormData>): Promise<Product> => {
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
export const deleteProduct = async (id: number): Promise<void> => {
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
export const uploadProductImage = async (productId: number, imageFile: File): Promise<Product> => {
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

/**
 * (NUEVO) Sube múltiples imágenes para un producto (hasta 3).
 * @param productId - El ID del producto.
 * @param imageFiles - Array de archivos de imagen (objetos File).
 * @returns El producto actualizado con las nuevas URLs de imágenes.
 */
export const uploadProductImages = async (productId: number, imageFiles: File[]): Promise<Product> => {
  const formData = new FormData();

  // Limitar a 3 imágenes máximo
  const filesToUpload = imageFiles.slice(0, 3);
  filesToUpload.forEach((file) => {
    formData.append('images', file); // La clave 'images' debe coincidir con upload.array('images', 3)
  });

  try {
    const response = await api.post<Product>(
      `/products/${productId}/upload-images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error uploading images for product ${productId}:`, error);
    throw error;
  }
};

/**
 * (NUEVO) Sube una imagen individual para un producto en un índice específico.
 * @param productId - El ID del producto.
 * @param imageFile - Archivo de imagen (objeto File).
 * @param index - Índice de la imagen (0, 1, o 2).
 * @returns El producto actualizado con la nueva URL de imagen.
 */
export const uploadProductImageByIndex = async (productId: number, imageFile: File, index: number): Promise<Product> => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await api.post<Product>(
      `/products/${productId}/upload-image/${index}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error uploading image ${index} for product ${productId}:`, error);
    throw error;
  }
};

/**
 * (NUEVO) Elimina una imagen individual de un producto en un índice específico.
 * @param productId - El ID del producto.
 * @param index - Índice de la imagen a eliminar (0, 1, o 2).
 * @returns El producto actualizado con la imagen eliminada.
 */
export const deleteProductImageByIndex = async (productId: number, index: number): Promise<Product> => {
  try {
    const response = await api.delete<Product>(
      `/products/${productId}/image/${index}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting image ${index} for product ${productId}:`, error);
    throw error;
  }
};

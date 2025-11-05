// services/categoryService.ts

import api from './api';
import { Category, CategoryFormData, Product } from '@mi-tienda/types';

/**
 * Obtiene todas las categorías desde la API.
 * @returns Una promesa que resuelve a un array de categorías.
 */
export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Lanza el error para que react-query pueda manejarlo
    throw error;
  }
};

/**
 * Crea una nueva categoría.
 * @param data - Los datos de la categoría validados por Zod.
 * @returns La categoría recién creada.
 */
export const createCategory = async (data: CategoryFormData): Promise<Category> => {
  try {
    // El token se adjunta automáticamente gracias a 'setAuthToken' en useAuth.tsx
    const response = await api.post<Category>('/categories', data);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Actualiza una categoría existente.
 * @param id - El ID de la categoría a actualizar.
 * @param data - Los datos parciales de la categoría a actualizar (validados por Zod).
 * @returns La categoría actualizada.
 */
export const updateCategory = async (id: number, data: Partial<CategoryFormData>): Promise<Category> => {
  try {
    // El token se adjunta automáticamente
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina una categoría.
 * @param id - El ID de la categoría a eliminar.
 * @returns Una promesa que se resuelve cuando la eliminación es exitosa.
 */
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    // El token se adjunta automáticamente
    await api.delete(`/categories/${id}`);
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los productos asociados a una categoría específica.
 * @param categoryId - El ID de la categoría.
 * @returns Promise<Product[]> - Lista de productos de la categoría.
 */
export const getCategoryProducts = async (categoryId: number): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>(`/categories/${categoryId}/products`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};

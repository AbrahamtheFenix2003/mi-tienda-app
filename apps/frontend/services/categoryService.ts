// services/categoryService.ts

import api from './api';
import { Category } from '@mi-tienda/types';

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

// Aquí podrías añadir createCategory, updateCategory, deleteCategory en el futuro

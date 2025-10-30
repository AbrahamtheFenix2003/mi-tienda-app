// services/purchaseService.ts

import api from './api';
import { Purchase, PurchaseFormData } from '@mi-tienda/types';

/**
 * Obtiene todas las compras desde la API.
 * @returns Promise<Purchase[]>
 */
export const fetchPurchases = async (): Promise<Purchase[]> => {
  try {
    const response = await api.get<Purchase[]>('/purchases');
    return response.data;
  } catch (error) {
    console.error('Error fetching purchases:', error);
    // Lanza el error para que react-query pueda manejarlo
    throw error;
  }
};
/**
 * Crea una nueva compra
 * @param data - Los datos de la compra validados por Zod
 * @returns Promise<Purchase>
 */
export const createPurchase = async (data: PurchaseFormData): Promise<Purchase> => {
  try {
    const response = await api.post<Purchase>('/purchases', data);
    return response.data;
  } catch (error) {
    console.error('Error creating purchase:', error);
    throw error;
  }
};
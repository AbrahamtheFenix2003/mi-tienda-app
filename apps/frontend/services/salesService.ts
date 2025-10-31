// apps/frontend/services/salesService.ts

import api from './api';
import { Sale, SaleFormData } from '@mi-tienda/types';

/**
 * Obtiene la lista completa de ventas registradas en el sistema.
 * @returns Una promesa que resuelve a un array de objetos Sale.
 */
export const fetchSales = async (): Promise<Sale[]> => {
  try {
    const response = await api.get<Sale[]>('/sales');
    return response.data;
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw error; // Relanzar para que TanStack Query pueda manejarlo
  }
};

/**
 * Obtiene el detalle de una venta específica por su ID.
 * @param id - El ID único de la venta.
 * @returns Una promesa que resuelve a un objeto Sale.
 */
export const fetchSaleById = async (id: string): Promise<Sale> => {
  try {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sale by ID:", error);
    throw error; // Relanzar para que TanStack Query pueda manejarlo
  }
};

/**
 * Registra una nueva venta en el sistema.
 * Dispara la lógica transaccional FIFO en el backend.
 * @param data - Los datos del formulario de la venta, validados con Zod.
 * @returns Una promesa que resuelve a la venta recién creada.
 */
export const createSale = async (data: SaleFormData): Promise<Sale> => {
  try {
    const response = await api.post<Sale>('/sales', data);
    return response.data;
  } catch (error) {
    console.error("Error creating sale:", error);
    throw error; // Relanzar para que TanStack Query pueda manejarlo
  }
};
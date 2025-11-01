// apps/frontend/services/inventoryService.ts

import api from './api';
import { StockLot, StockMovement } from '@mi-tienda/types';

/**
 * Obtiene todos los lotes de stock desde la API.
 * @returns Una promesa que resuelve a un array de objetos StockLot.
 */
export const fetchStockLots = async (): Promise<StockLot[]> => {
  try {
    const response = await api.get<StockLot[]>('/inventory/lots');
    return response.data;
  } catch (error) {
    console.error("Error fetching stock lots:", error);
    throw error; // Relanzar para que TanStack Query pueda manejarlo
  }
};

/**
 * Obtiene todos los movimientos de stock desde la API.
 * @returns Una promesa que resuelve a un array de objetos StockMovement.
 */
export const fetchStockMovements = async (): Promise<StockMovement[]> => {
  try {
    const response = await api.get<StockMovement[]>('/inventory/movements');
    return response.data;
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    throw error; // Relanzar para que TanStack Query pueda manejarlo
  }
};
import api from './api';
import type { CashMovementWithRelations } from '@mi-tienda/types';

export async function getCashMovements(): Promise<CashMovementWithRelations[]> {
  try {
    const response = await api.get<CashMovementWithRelations[]>('/cash/movements');
    return response.data;
  } catch (error) {
    console.error('Error fetching cash movements:', error);
    throw error;
  }
}
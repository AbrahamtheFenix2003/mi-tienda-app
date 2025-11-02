import api from './api';
import type { CashMovementWithRelations, CreateManualMovementInput, UpdateManualMovementInput } from '@mi-tienda/types';

export async function getCashMovements(): Promise<CashMovementWithRelations[]> {
  try {
    const response = await api.get<CashMovementWithRelations[]>('/cash/movements');
    return response.data;
  } catch (error) {
    console.error('Error fetching cash movements:', error);
    throw error;
  }
}

export const createManualMovement = (data: CreateManualMovementInput) => {
  return api.post('/cash/manual', data);
};

export const updateManualMovement = (id: string, data: UpdateManualMovementInput) => {
  return api.put(`/cash/manual/${id}`, data);
};
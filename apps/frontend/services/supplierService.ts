// services/supplierService.ts

import api from './api';
import { Supplier, SupplierFormData } from '@mi-tienda/types';

/**
 * Obtiene todos los proveedores desde la API.
 * @returns Promise<Supplier[]>
 */
export const fetchSuppliers = async (): Promise<Supplier[]> => {
  try {
    const response = await api.get<Supplier[]>('/suppliers');
    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    // Lanza el error para que react-query pueda manejarlo
    throw error;
  }
};

/**
 * Crea un nuevo proveedor.
 * @param data - Los datos del proveedor validados por Zod.
 * @returns El proveedor recién creado.
 */
export const createSupplier = async (data: SupplierFormData): Promise<Supplier> => {
  try {
    // El token se adjunta automáticamente gracias a 'setAuthToken' en useAuth.tsx
    const response = await api.post<Supplier>('/suppliers', data);
    return response.data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
};

/**
 * Actualiza un proveedor existente.
 * @param id - El ID del proveedor a actualizar.
 * @param data - Los datos parciales del proveedor a actualizar (validados por Zod).
 * @returns El proveedor actualizado.
 */
export const updateSupplier = async (id: number, data: Partial<SupplierFormData>): Promise<Supplier> => {
  try {
    // El token se adjunta automáticamente
    const response = await api.put<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating supplier ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un proveedor.
 * @param id - El ID del proveedor a eliminar.
 * @returns Una promesa que se resuelve cuando la eliminación es exitosa.
 */
export const deleteSupplier = async (id: number): Promise<void> => {
  try {
    // El token se adjunta automáticamente
    await api.delete(`/suppliers/${id}`);
  } catch (error) {
    console.error(`Error deleting supplier ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene todas las compras asociadas a un proveedor específico.
 * @param supplierId - El ID del proveedor.
 * @returns Promise<Purchase[]> - Lista de compras del proveedor.
 */
export const getSupplierPurchases = async (supplierId: number) => {
  try {
    const response = await api.get(`/suppliers/${supplierId}/purchases`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching purchases for supplier ${supplierId}:`, error);
    throw error;
  }
};
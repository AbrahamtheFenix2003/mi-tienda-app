import prisma from '../utils/prisma.js';
import { Supplier } from '@prisma/client';

export type SupplierData = {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
};

/**
 * Obtiene todos los proveedores activos, incluyendo su categoria.
 */
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  return prisma.supplier.findMany({
    where: {
      isActive: true,
    },
    orderBy: { name: 'asc' },
  });
};

/**
 * Busca un proveedor por su ID.
 */
export const getSupplierById = async (id: number): Promise<Supplier | null> => {
  return prisma.supplier.findUnique({
    where: { id },
  });
};

/**
 * Crea un nuevo proveedor.
 * @param data Objeto con los datos del proveedor.
 */
export const createSupplier = async (data: SupplierData): Promise<Supplier> => {
  const supplier = await prisma.supplier.create({
    data: {
      ...data,
      isActive: data.isActive ?? true, // Asegurar que siempre sea activo al crear
    },
  });
  return supplier;
};

/**
 * Actualiza un proveedor existente.
 * @param id El ID del proveedor a actualizar.
 * @param data Objeto con los datos a actualizar.
 */
export const updateSupplier = async (id: number, data: Partial<SupplierData>): Promise<Supplier> => {
  const supplier = await prisma.supplier.update({
    where: { id },
    data,
  });
  return supplier;
};

/**
 * Elimina un proveedor (soft delete - marca como inactivo).
 * @param id El ID del proveedor a eliminar.
 */
export const deleteSupplier = async (id: number): Promise<Supplier> => {
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { isActive: false },
  });
  return supplier;
};

/**
 * (Opcional) Obtiene todos los proveedores, incluyendo los eliminados.
 * Útil para administradores que necesiten ver proveedores eliminados.
 */
export const getAllSuppliersIncludingDeleted = async (): Promise<Supplier[]> => {
  return prisma.supplier.findMany({
    orderBy: { name: 'asc' },
  });
};

/**
 * (Opcional) Reactiva un proveedor previamente eliminado.
 * @param id El ID del proveedor a reactivar.
 */
export const restoreSupplier = async (id: number): Promise<Supplier> => {
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { isActive: true },
  });
  return supplier;
};

/**
 * Obtiene todas las compras asociadas a un proveedor específico.
 * @param supplierId El ID del proveedor.
 */
export const getSupplierPurchases = async (supplierId: number) => {
  return prisma.purchase.findMany({
    where: { supplierId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      supplier: true,
    },
    orderBy: { purchaseDate: 'desc' },
  });
};
import prisma from '../utils/prisma.js';
import { Supplier } from '@prisma/client';

export type SupplierData = {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export const getAllSuppliers = async (): Promise<Supplier[]> => {
  return prisma.supplier.findMany({
    orderBy: { name: 'asc' },
  });
};

export const getSupplierById = async (id: number): Promise<Supplier | null> => {
  return prisma.supplier.findUnique({
    where: { id },
  });
};

export const createSupplier = async (data: SupplierData): Promise<Supplier> => {
  const supplier = await prisma.supplier.create({
    data,
  });
  return supplier;
};

export const updateSupplier = async (id: number, data: Partial<SupplierData>): Promise<Supplier> => {
  const supplier = await prisma.supplier.update({
    where: { id },
    data,
  });
  return supplier;
};

export const deleteSupplier = async (id: number): Promise<Supplier> => {
  const supplier = await prisma.supplier.delete({
    where: { id },
  });
  return supplier;
};
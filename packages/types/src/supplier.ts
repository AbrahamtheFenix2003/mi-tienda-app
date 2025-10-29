// packages/types/src/supplier.ts

import { z } from 'zod';

export interface Supplier {
  id: number;
  name: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// --- ESQUEMA DE VALIDACIÓN ZOD PARA SUPPLIERS ---

export const supplierSchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }).max(100, { message: "El nombre no puede exceder 100 caracteres." }),
  contact: z.string().max(100, { message: "El contacto no puede exceder 100 caracteres." }).optional().nullable(),
  phone: z.string().max(20, { message: "El teléfono no puede exceder 20 caracteres." }).optional().nullable(),
  email: z.string().email({ message: "Formato de email inválido." }).optional().nullable(),
  address: z.string().max(200, { message: "La dirección no puede exceder 200 caracteres." }).optional().nullable(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;

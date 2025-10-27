// packages/types/src/product.ts

import { z } from 'zod';
import { Category } from './category'; // Importa desde este mismo paquete

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: string;
  originalPrice?: string | null;
  acquisitionCost?: string | null;
  stock: number;
  code: string; // Obligatorio en Prisma schema
  imageUrl?: string | null;
  imageUrl2?: string | null;
  imageUrl3?: string | null;
  imageUrl4?: string | null;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  categoryId?: string | null;
  category?: Category | null;
}

// --- NUEVO ESQUEMA DE VALIDACIÓN ZOD ---

export const productSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  slug: z.string().min(3, { message: "El slug debe tener al menos 3 caracteres." })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "El slug solo puede contener letras minúsculas, números y guiones." }),
  
  description: z.string().optional().nullable(),
  
  price: z.preprocess(
    (val) => Number(String(val)),
    z.number().min(0.01, { message: "El precio debe ser positivo." })
  ),

  originalPrice: z.preprocess(
    (val) => {
      if (val === null || val === undefined || String(val).trim() === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    },
    z.number().min(0).optional().nullable()
  ),

  acquisitionCost: z.preprocess(
    (val) => {
      if (val === null || val === undefined || String(val).trim() === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    },
    z.number().min(0).optional().nullable()
  ),

  stock: z.preprocess(
    (val) => {
      if (val === null || val === undefined || String(val).trim() === '') return 0;
      return parseInt(String(val), 10);
    },
    z.number().int({ message: "El stock debe ser un número entero." }).min(0, { message: "El stock no puede ser negativo." }).default(0).optional()
  ),

  categoryId: z.preprocess(
    (val) => {
      if (val === null || val === undefined || String(val).trim() === '') return null;
      return val;
    },
    z.string().optional().nullable()
  ),
  
  imageUrl: z.preprocess(
    (val) => {
      // Si el valor es null, undefined o string vacío, devolver undefined
      if (val === null || val === undefined || String(val).trim() === '') return undefined;
      return val;
    },
    z.string().url({ message: "URL de imagen inválida." }).optional()
  ),
  isFeatured: z.boolean().default(false).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
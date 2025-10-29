// packages/types/src/category.ts

import { z } from 'zod';

export interface Category {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// --- ESQUEMA DE VALIDACIÓN ZOD PARA CATEGORÍAS ---

export const categorySchema = z.object({
  name: z.string().min(1, { message: "El nombre es requerido." }).max(100, { message: "El nombre no puede exceder 100 caracteres." }),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
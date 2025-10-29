// packages/types/src/purchase.ts

import { z } from 'zod';
import { Product } from './product.js';
import { Supplier } from './supplier.js';

// ----------------------------------------------------
// ENUMS - Copiados desde schema.prisma
// ----------------------------------------------------

export type PaymentMethod = "YAPE" | "PLIN" | "EFECTIVO" | "TRANSFERENCIA" | "CHEQUE" | "CREDITO";

export type PurchaseStatus = "REGISTRADA" | "RECIBIDA_PARCIAL" | "RECIBIDA_COMPLETA" | "ANULADA";

// ----------------------------------------------------
// INTERFACES
// ----------------------------------------------------

// Interfaz para el item de compra (como se verá en el frontend)
export interface PurchaseItem {
  id: string;
  quantity: number;
  purchasePrice: string; // Decimal -> string
  productId: number;
  product?: Product | null; // Incluir el producto
  loteId?: string | null;
  fechaVencimiento?: string | null; // DateTime -> string
}

// Interfaz para la compra detallada (para GET)
export interface Purchase {
  id: string;
  purchaseDate: string; // DateTime -> string
  invoiceNumber?: string | null;
  paymentMethod?: PaymentMethod | null;
  notes?: string | null;
  totalAmount: string; // Decimal -> string
  status: PurchaseStatus;
  supplierId: number;
  supplier?: Supplier | null; // Incluir el proveedor
  registeredById: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseItem[];
}

// ----------------------------------------------------
// ESQUEMAS ZOD (Formulario)
// ----------------------------------------------------

export const purchaseItemSchema = z.object({
  productId: z.number().int().positive({ message: "Debe seleccionar un producto." }),
  quantity: z.number().int().min(1, { message: "La cantidad debe ser al menos 1." }),
  purchasePrice: z.preprocess(
    (val) => Number(String(val)),
    z.number().min(0.01, { message: "El precio de compra debe ser positivo." })
  ),
  loteId: z.string().optional().nullable(),
  fechaVencimiento: z.preprocess(
    (val) => {
      // Si es un string vacío, null, o undefined, tratarlo como null
      if (val === "" || val === null || val === undefined) return null;
      // Intentar convertir cualquier otro valor (asumimos string) a Fecha
      const date = new Date(val as string);
      // Devolver la fecha solo si es válida, sino null
      return isNaN(date.getTime()) ? null : date;
    },
    z.date().optional().nullable() // Validar que el resultado sea una fecha, opcional o nulo
  ),
});

export const purchaseSchema = z.object({
  purchaseDate: z.coerce.date(),
  supplierId: z.number().int().positive({ message: "Debe seleccionar un proveedor." }),
  invoiceNumber: z.string().optional().nullable(),
  paymentMethod: z.enum(["YAPE", "PLIN", "EFECTIVO", "TRANSFERENCIA", "CHEQUE", "CREDITO"]).optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseItemSchema).min(1, { message: "Debe agregar al menos un producto a la compra." })
});

export type PurchaseFormData = z.infer<typeof purchaseSchema>;
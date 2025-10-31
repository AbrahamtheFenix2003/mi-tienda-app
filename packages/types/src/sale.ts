// packages/types/src/sale.ts

import { Product } from './product.js';
import { User } from './user.js';
import { PaymentMethod } from './purchase.js'; // Reutilizamos el tipo
import { z } from 'zod';

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "ANNULLED";
export type DeliveryMethod = "OFICINA" | "DELIVERY" | "ENVIO";

export interface SaleItem {
  id: string;
  quantity: number;
  price: string; // Decimal -> string
  cost: string; // Decimal -> string
  saleId: string;
  productId: number;
  product?: Product | null; // Incluir el producto
}

export interface Sale {
  id: string;
  status: OrderStatus;
  totalAmount: string; // Decimal
  subtotalAmount: string; // Decimal
  totalCost?: string | null; // Decimal
  profit?: string | null; // Decimal
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  deliveryCost: string; // Decimal
  deliveryLocation?: string | null;
  customerName: string;
  customerPhone?: string | null;
  soldById: string;
  soldBy?: User | null; // Incluir el usuario
  createdAt: string; // DateTime
  updatedAt: string; // DateTime
  items: SaleItem[];
}

// --- ESQUEMAS ZOD (Formulario) ---

export const saleItemSchema = z.object({
  productId: z.number().int().positive({ message: "Debe seleccionar un producto." }),
  quantity: z.number().int().min(1, { message: "La cantidad debe ser al menos 1." }),
  price: z.preprocess( // El precio de venta se toma del producto, pero puede ser sobreescrito
    (val) => Number(String(val)),
    z.number().min(0.01, { message: "El precio debe ser positivo." })
  ),
});

export const saleSchema = z.object({
  customerName: z.string().min(3, { message: "Nombre del cliente es requerido." }),
  customerPhone: z.string().optional().nullable(),
  paymentMethod: z.enum(["YAPE", "PLIN", "EFECTIVO", "TRANSFERENCIA", "CHEQUE", "CREDITO"]),
  deliveryMethod: z.enum(["OFICINA", "DELIVERY", "ENVIO"]),
  deliveryCost: z.preprocess(
    (val) => {
      if (val === null || val === undefined || String(val).trim() === '') return 0;
      return Number(String(val));
    },
    z.number().min(0, { message: "Costo de envío no puede ser negativo." }).default(0)
  ),
  deliveryLocation: z.string().optional().nullable(),
  items: z.array(saleItemSchema).min(1, { message: "Debe agregar al menos un producto." })
});

export type SaleFormData = z.infer<typeof saleSchema>;
// packages/types/src/inventory.ts

import { Product } from './product.js';
import { Supplier } from './supplier.js';
import { User } from './user.js';

// Enums de Inventario (basados en schema.prisma)
export type LotStatus = "ACTIVO" | "AGOTADO" | "VENCIDO" | "ELIMINADO";
export type StockMovementType = "ENTRADA" | "SALIDA" | "AJUSTE";
export type StockMovementSubType = "COMPRA" | "VENTA" | "DEVOLUCION_CLIENTE" | "DEVOLUCION_PROVEEDOR" | "AJUSTE_MANUAL" | "ANULACION_VENTA" | "LOTE_LEGACY" | "AJUSTE_COMPRA_EDITADA";

// Interfaz StockLot
export interface StockLot {
  id: string;
  loteId: string;
  quantity: number;
  originalQuantity: number;
  costPerUnit: string; // Decimal -> string
  entryDate: string; // DateTime -> string
  expiryDate: string | null; // DateTime -> string
  status: LotStatus;
  productId: number;
  product?: Product | null; // Relación incluida
  supplierId: number | null;
  supplier?: Supplier | null; // Relación incluida
  purchaseId: string | null;
}

// Interfaz StockMovement
export interface StockMovement {
  id: string;
  quantity: number;
  type: StockMovementType;
  subType: StockMovementSubType | null;
  costPerUnit: string | null; // Decimal -> string
  totalCost: string | null; // Decimal -> string
  referenceId: string | null; // ID de Sale o Purchase
  date: string; // DateTime -> string
  productId: number;
  product?: Product | null; // Relación incluida
  loteId: string | null;
  lote?: StockLot | null; // Relación incluida
  userId: string;
  user?: User | null; // Relación incluida
}
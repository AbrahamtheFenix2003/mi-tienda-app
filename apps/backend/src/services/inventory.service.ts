// apps/backend/src/services/inventory.service.ts

import prisma from '../utils/prisma.js';
import { Prisma } from '@prisma/client';

// Definir tipos para los resultados de Prisma con relaciones incluidas
type PrismaStockLotWithRelations = Prisma.StockLotGetPayload<{
  include: {
    product: true;
    supplier: true;
  };
}>;

type PrismaStockMovementWithRelations = Prisma.StockMovementGetPayload<{
  include: {
    product: true;
    lote: true;
    user: true;
  };
}>;

// Helper para mapear lotes de Prisma a un formato más amigable
const mapStockLotFromPrisma = (lot: PrismaStockLotWithRelations) => {
  return {
    id: lot.id,
    loteId: lot.loteId,
    quantity: lot.quantity,
    originalQuantity: lot.originalQuantity,
    costPerUnit: lot.costPerUnit.toString(),
    entryDate: lot.entryDate.toISOString(),
    expiryDate: lot.expiryDate ? lot.expiryDate.toISOString() : null,
    status: lot.status,
    isLegacy: lot.isLegacy,
    productId: lot.productId,
    product: {
      id: lot.product.id,
      name: lot.product.name,
      code: lot.product.code,
      // Incluir otros campos relevantes del producto si es necesario
    },
    supplierId: lot.supplierId,
    supplier: lot.supplier ? {
      id: lot.supplier.id,
      name: lot.supplier.name,
      // Incluir otros campos relevantes del proveedor si es necesario
    } : null,
    createdAt: lot.createdAt.toISOString(),
    updatedAt: lot.updatedAt.toISOString(),
  };
};

// Helper para mapear movimientos de Prisma a un formato más amigable
const mapStockMovementFromPrisma = (movement: PrismaStockMovementWithRelations) => {
  return {
    id: movement.id,
    quantity: movement.quantity,
    type: movement.type,
    subType: movement.subType,
    costPerUnit: movement.costPerUnit ? movement.costPerUnit.toString() : null,
    totalCost: movement.totalCost ? movement.totalCost.toString() : null,
    notes: movement.notes,
    referenceId: movement.referenceId,
    date: movement.date.toISOString(),
    productId: movement.productId,
    product: {
      id: movement.product.id,
      name: movement.product.name,
      code: movement.product.code,
      // Incluir otros campos relevantes del producto si es necesario
    },
    loteId: movement.loteId,
    lote: movement.lote ? {
      id: movement.lote.id,
      loteId: movement.lote.loteId,
      // Incluir otros campos relevantes del lote si es necesario
    } : null,
    userId: movement.userId,
    user: {
      id: movement.user.id,
      email: movement.user.email,
      name: movement.user.name,
      role: movement.user.role,
    },
    createdAt: movement.createdAt.toISOString(),
  };
};

// Configuración de include para consultas con relaciones
const stockLotInclude = {
  product: true,
  supplier: true,
} as const;

const stockMovementInclude = {
  product: true,
  lote: true,
  user: true,
} as const;

export const inventoryService = {
  /**
   * Obtiene todos los lotes de stock con sus relaciones (producto y proveedor).
   */
  async getStockLots() {
    try {
      const lots = await prisma.stockLot.findMany({
        include: stockLotInclude,
        orderBy: {
          entryDate: 'desc',
        },
      });

      return lots.map(mapStockLotFromPrisma);
    } catch (error) {
      throw new Error(`Error al obtener lotes de stock: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  /**
   * Obtiene todos los movimientos de stock con sus relaciones (producto, lote y usuario).
   */
  async getStockMovements() {
    try {
      const movements = await prisma.stockMovement.findMany({
        include: stockMovementInclude,
        orderBy: {
          date: 'desc',
        },
      });

      return movements.map(mapStockMovementFromPrisma);
    } catch (error) {
      throw new Error(`Error al obtener movimientos de stock: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },
};

export default inventoryService;
// apps/backend/src/services/sales.service.ts

import prisma from '../utils/prisma.js';
import { Sale, SaleItem, SaleFormData } from '@mi-tienda/types';
import { Prisma, StockMovementType, StockMovementSubType, CashMovementType, OrderStatus, LotStatus } from '@prisma/client';

// Tipo para los resultados de Prisma con relaciones incluidas
type PrismaSaleWithRelations = Prisma.SaleGetPayload<{
  include: {
    soldBy: true;
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

// Helper para mapear productos de Prisma a la interfaz Product
function mapProduct(product: PrismaSaleWithRelations['items'][0]['product']): any {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? null,
    price: product.price.toString(),
    originalPrice: product.originalPrice ? product.originalPrice.toString() : null,
    acquisitionCost: product.acquisitionCost ? product.acquisitionCost.toString() : null,
    stock: product.stock,
    code: product.code,
    imageUrl: product.imageUrl ?? null,
    imageUrl2: product.imageUrl2 ?? null,
    imageUrl3: product.imageUrl3 ?? null,
    imageUrl4: product.imageUrl4 ?? null,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    tags: product.tags,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    categoryId: product.categoryId ?? null,
    category: null, // No se incluye en esta consulta
  };
}

// Helper para mapear usuarios de Prisma a la interfaz User
function mapUser(user: PrismaSaleWithRelations['soldBy']): any {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

// Helper para mapear items de venta de Prisma a la interfaz SaleItem
function mapSaleItem(item: PrismaSaleWithRelations['items'][0]): SaleItem {
  return {
    id: item.id,
    quantity: item.quantity,
    price: item.price.toString(),
    cost: item.cost.toString(),
    saleId: item.saleId,
    productId: item.productId,
    product: mapProduct(item.product),
  };
}

// Helper para mapear una venta completa de Prisma a la interfaz Sale
function mapSale(sale: PrismaSaleWithRelations): Sale {
  return {
    id: sale.id,
    status: sale.status as any,
    totalAmount: sale.totalAmount.toString(),
    subtotalAmount: sale.subtotalAmount.toString(),
    totalCost: sale.totalCost ? sale.totalCost.toString() : null,
    profit: sale.profit ? sale.profit.toString() : null,
    paymentMethod: sale.paymentMethod as any,
    deliveryMethod: sale.deliveryMethod as any,
    deliveryCost: sale.deliveryCost.toString(),
    deliveryLocation: sale.deliveryLocation ?? null,
    customerName: sale.customerName,
    customerPhone: sale.customerPhone ?? null,
    soldById: sale.soldById,
    soldBy: mapUser(sale.soldBy),
    createdAt: sale.createdAt.toISOString(),
    updatedAt: sale.updatedAt.toISOString(),
    items: sale.items.map(mapSaleItem),
  };
}

// Configuración de include para consultas con relaciones
const saleInclude = {
  soldBy: true,
  items: {
    include: {
      product: true,
    },
  },
} as const;

export const salesService = {
  async getAllSales(): Promise<Sale[]> {
    const sales = await prisma.sale.findMany({
      include: saleInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sales.map(mapSale);
  },

  async getSaleById(id: string): Promise<Sale | null> {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: saleInclude,
    });

    return sale ? mapSale(sale) : null;
  },

  async createSale(data: SaleFormData, userId: string): Promise<Sale> {
    return await prisma.$transaction(async (tx) => {
      // 0. Generar ID secuencial personalizado (VENTA-XXX)
      const lastSale = await tx.sale.findFirst({
        where: {
          id: {
            startsWith: 'VENTA-'
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true
        }
      });

      let nextNumber = 1;
      if (lastSale && lastSale.id) {
        const match = lastSale.id.match(/VENTA-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }

      const saleId = `VENTA-${String(nextNumber).padStart(3, '0')}`;

      // 1. Validación de stock previo para todos los productos
      const productIds = data.items.map(item => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, stock: true, name: true }
      });

      // Verificar que todos los productos existen
      if (products.length !== productIds.length) {
        throw new Error('Uno o más productos no existen');
      }

      // Verificar stock suficiente para cada producto
      for (const item of data.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto ${product.name}. Stock disponible: ${product.stock}, solicitado: ${item.quantity}`);
        }
      }

      // 2. Preparar cálculos y datos para la transacción
      const saleItemsData: any[] = [];
      const stockMovementsData: any[] = [];
      const stockLotUpdates: any[] = [];
      const productUpdates: any[] = [];
      
      let subtotalAmount = 0;
      let totalCost = 0;

      // 3. Procesar cada item de venta con lógica FIFO
      for (const item of data.items) {
        // Obtener lotes activos para este producto (FIFO)
        const stockLots = await tx.stockLot.findMany({
          where: {
            productId: item.productId,
            quantity: { gt: 0 },
            status: 'ACTIVO'
          },
          orderBy: { entryDate: 'asc' } // FIFO
        });

        let remainingQuantity = item.quantity;
        let totalCostForItem = 0;
        const saleItemCosts: number[] = [];

        // Consumir lotes en orden FIFO
        for (const lot of stockLots) {
          if (remainingQuantity <= 0) break;

          const quantityToUse = Math.min(remainingQuantity, lot.quantity);
          const costForThisQuantity = quantityToUse * Number(lot.costPerUnit);

          totalCostForItem += costForThisQuantity;
          saleItemCosts.push(Number(lot.costPerUnit));

          // Actualizar lote
          const newQuantity = lot.quantity - quantityToUse;
          stockLotUpdates.push({
            id: lot.id,
            quantity: newQuantity,
            status: newQuantity === 0 ? 'AGOTADO' : 'ACTIVO'
          });

          // Crear movimiento de stock para este lote
          stockMovementsData.push({
            quantity: -quantityToUse, // Negativo para salida
            type: 'SALIDA',
            subType: 'VENTA',
            costPerUnit: lot.costPerUnit,
            totalCost: costForThisQuantity,
            productId: item.productId,
            loteId: lot.id,
            userId: userId,
            referenceId: 'temp', // Se actualizará después con el ID de la venta
            notes: `Venta de ${quantityToUse} unidades del lote ${lot.loteId}`
          });

          remainingQuantity -= quantityToUse;
        }

        if (remainingQuantity > 0) {
          throw new Error(`Stock insuficiente después de procesar todos los lotes para el producto ${item.productId}`);
        }

        // Calcular costo unitario promedio para este item
        const totalQuantity = item.quantity;
        const weightedCost = saleItemCosts.reduce((sum, cost, index) => {
          const quantityFromThisLot = Math.min(data.items.find(i => i.productId === item.productId)?.quantity || 0, stockLots[index]?.quantity || 0);
          return sum + (cost * quantityFromThisLot);
        }, 0);
        const averageCost = weightedCost / totalQuantity;

        saleItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          cost: averageCost
        });

        subtotalAmount += item.quantity * item.price;
        totalCost += totalCostForItem;
      }

      // 4. Crear la Sale principal
      const totalAmount = subtotalAmount + data.deliveryCost;
      const profit = subtotalAmount - totalCost;

      const sale = await tx.sale.create({
        data: {
          id: saleId, // ID personalizado (VENTA-XXX)
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          paymentMethod: data.paymentMethod,
          deliveryMethod: data.deliveryMethod,
          deliveryCost: data.deliveryCost,
          deliveryLocation: data.deliveryLocation,
          soldById: userId,
          totalAmount: totalAmount,
          subtotalAmount: subtotalAmount,
          totalCost: totalCost,
          profit: profit,
          status: 'PAID'
        }
      });

      // Actualizar los movimientos de stock con el referenceId correcto
      for (const movement of stockMovementsData) {
        movement.referenceId = sale.id;
      }

      // 5. Crear los SaleItem
      const createdSaleItems = await tx.saleItem.createMany({
        data: saleItemsData.map(itemData => ({
          ...itemData,
          saleId: sale.id
        }))
      });

      // 6. Actualizar StockLot con las nuevas cantidades
      for (const update of stockLotUpdates) {
        await tx.stockLot.update({
          where: { id: update.id },
          data: {
            quantity: update.quantity,
            status: update.status
          }
        });
      }

      // 7. Actualizar stock total en Product
      for (const item of data.items) {
        productUpdates.push({
          id: item.productId,
          stock: { decrement: item.quantity }
        });
      }

      for (const update of productUpdates) {
        await tx.product.update({
          where: { id: update.id },
          data: {
            stock: update.stock
          }
        });
      }

      // 8. Crear los StockMovement
      await tx.stockMovement.createMany({
        data: stockMovementsData
      });

      // 9. Crear CashMovement para la entrada de dinero
      // Obtener saldo actual de caja (simplificado, asumimos que existe un registro de saldo)
      const currentCashMovements = await tx.cashMovement.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1
      });
      
      const previousBalance = currentCashMovements.length > 0 ? Number(currentCashMovements[0].newBalance) : 0;
      const newBalance = previousBalance + totalAmount;

      await tx.cashMovement.create({
        data: {
          type: 'ENTRADA',
          amount: totalAmount,
          category: 'Venta',
          description: `Venta #${sale.id} - Cliente: ${data.customerName}`,
          paymentMethod: data.paymentMethod,
          referenceId: sale.id,
          previousBalance: previousBalance,
          newBalance: newBalance,
          userId: userId
        }
      });

      // 10. Devolver la venta creada con todas sus relaciones
      const createdSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: saleInclude
      });

      if (!createdSale) {
        throw new Error('Error al crear la venta');
      }

      return mapSale(createdSale);
    });
  },
  // Función para anular una venta y revertir sus efectos
  async annulSale(saleId: string, userId: string): Promise<Sale> {
    return await prisma.$transaction(async (tx) => {
      // Paso A: Validar la Venta
      const sale = await tx.sale.findUniqueOrThrow({
        where: { id: saleId },
        include: saleInclude
      });

      // Validar que no esté ya anulada
      if (sale.status === OrderStatus.ANNULLED) {
        throw new Error("Esta venta ya ha sido anulada.");
      }

      // Paso B: Revertir Inventario (StockMovements)
      // Buscar todos los movimientos de salida asociados a esta venta
      const movementsToReverse = await tx.stockMovement.findMany({
        where: {
          referenceId: saleId,
          subType: StockMovementSubType.VENTA
        }
      });

      // Iterar sobre movementsToReverse
      for (const movement of movementsToReverse) {
        // Validación de Lote
        if (!movement.loteId) {
          throw new Error("Error de integridad: Movimiento sin lote asociado.");
        }

        // Reversión (Crear movimiento de ENTRADA)
        await tx.stockMovement.create({
          data: {
            quantity: Math.abs(movement.quantity), // Positivo para entrada
            type: StockMovementType.ENTRADA,
            subType: StockMovementSubType.ANULACION_VENTA,
            costPerUnit: movement.costPerUnit,
            totalCost: movement.totalCost ? Math.abs(Number(movement.totalCost)) : undefined,
            productId: movement.productId,
            loteId: movement.loteId,
            userId: userId,
            referenceId: saleId,
            date: new Date(),
            notes: `Anulación de venta #${saleId} - Devolución de ${Math.abs(movement.quantity)} unidades del lote ${movement.loteId}`
          }
        });

        // Devolver stock al Lote
        const lot = await tx.stockLot.findUnique({
          where: { id: movement.loteId }
        });

        if (lot) {
          const newQuantity = lot.quantity + Math.abs(movement.quantity);
          const newStatus = newQuantity > 0 ? LotStatus.ACTIVO : LotStatus.AGOTADO;

          await tx.stockLot.update({
            where: { id: movement.loteId },
            data: {
              quantity: newQuantity,
              status: newStatus
            }
          });
        }

        // Devolver stock al Producto
        await tx.product.update({
          where: { id: movement.productId },
          data: {
            stock: { increment: Math.abs(movement.quantity) }
          }
        });
      }

      // Paso C: Eliminar movimiento de caja original (en lugar de crear reversión)
      // Esto elimina completamente el movimiento y recalcula saldos como si nunca hubiera existido
      const existingCashMovement = await tx.cashMovement.findFirst({
        where: { referenceId: saleId }
      });

      if (existingCashMovement) {
        // Eliminar el movimiento de caja y recalcular saldos posteriores
        await tx.cashMovement.delete({
          where: { id: existingCashMovement.id }
        });

        // Recalcular saldos de todos los movimientos posteriores
        const subsequentMovements = await tx.cashMovement.findMany({
          where: {
            date: {
              gte: existingCashMovement.date
            }
          },
          orderBy: {
            date: 'asc'
          }
        });

        // Obtener el último saldo válido antes del movimiento eliminado
        const previousMovement = await tx.cashMovement.findFirst({
          where: {
            date: {
              lt: existingCashMovement.date
            }
          },
          orderBy: {
            date: 'desc'
          }
        });

        let runningBalance = previousMovement ? previousMovement.newBalance : new Prisma.Decimal(0);

        // Recalcular saldos para todos los movimientos posteriores
        for (const movement of subsequentMovements) {
          const prevBalance = runningBalance;
          
          // Calcular nuevo saldo basado en el tipo de movimiento
          if (movement.type === CashMovementType.ENTRADA) {
            runningBalance = prevBalance.plus(movement.amount);
          } else {
            runningBalance = prevBalance.sub(movement.amount);
          }

          await tx.cashMovement.update({
            where: { id: movement.id },
            data: {
              previousBalance: prevBalance,
              newBalance: runningBalance
            }
          });
        }
      }

      // Paso D: Anular la Venta
      const annulledSale = await tx.sale.update({
        where: { id: saleId },
        data: { status: OrderStatus.ANNULLED },
        include: saleInclude
      });

      // Paso E: Devolver Resultado Completo
      return mapSale(annulledSale);
    });
  }
};

export default salesService;

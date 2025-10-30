import prisma from '../utils/prisma.js';
import { Prisma, StockMovementType, StockMovementSubType, LotStatus, PurchaseStatus } from '@prisma/client';
import type { Purchase, PurchaseItem, Supplier, Product, PurchaseFormData } from '@mi-tienda/types';

// Tipo para los datos de entrada al crear una compra (sin incluir campos calculados)
export type PurchaseData = {
  purchaseDate: Date;
  supplierId: number;
  invoiceNumber?: string;
  paymentMethod?: string;
  notes?: string;
  items: {
    productId: number;
    quantity: number;
    purchasePrice: Prisma.Decimal;
    loteId?: string;
    fechaVencimiento?: Date;
  }[];
};

type PrismaPurchaseWithRelations = Prisma.PurchaseGetPayload<{
  include: {
    supplier: true;
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

const purchaseInclude = {
  supplier: true,
  items: {
    include: {
      product: true,
    },
  },
} as const;

const mapSupplier = (supplier: PrismaPurchaseWithRelations['supplier']): Supplier => ({
  id: supplier.id,
  name: supplier.name,
  contact: supplier.contact ?? null,
  phone: supplier.phone ?? null,
  email: supplier.email ?? null,
  address: supplier.address ?? null,
  isActive: supplier.isActive,
  createdAt: supplier.createdAt.toISOString(),
  updatedAt: supplier.updatedAt.toISOString(),
});

const mapProduct = (product: PrismaPurchaseWithRelations['items'][0]['product']): Product => ({
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
});

const mapPurchaseItem = (item: PrismaPurchaseWithRelations['items'][0]): PurchaseItem => ({
  id: item.id,
  quantity: item.quantity,
  purchasePrice: item.purchasePrice.toString(),
  productId: item.productId,
  product: mapProduct(item.product),
  loteId: item.loteId ?? null,
  fechaVencimiento: item.fechaVencimiento ? item.fechaVencimiento.toISOString() : null,
});

const mapPurchase = (purchase: PrismaPurchaseWithRelations): Purchase => ({
  id: purchase.id,
  purchaseDate: purchase.purchaseDate.toISOString(),
  invoiceNumber: purchase.invoiceNumber ?? null,
  paymentMethod: purchase.paymentMethod as any ?? null,
  notes: purchase.notes ?? null,
  totalAmount: purchase.totalAmount.toString(),
  status: purchase.status as any,
  supplierId: purchase.supplierId,
  supplier: mapSupplier(purchase.supplier),
  registeredById: purchase.registeredById,
  createdAt: purchase.createdAt.toISOString(),
  updatedAt: purchase.updatedAt.toISOString(),
  items: purchase.items.map(mapPurchaseItem),
});

/**
 * Obtiene todas las compras con sus relaciones (proveedor e items con productos).
 */
export const getAllPurchases = async (): Promise<Purchase[]> => {
  const purchases = await prisma.purchase.findMany({
    include: purchaseInclude,
    orderBy: {
      purchaseDate: 'desc',
    },
  });

  return purchases.map(mapPurchase);
};

/**
 * Busca una compra por su ID, incluyendo proveedor e items con productos.
 */
export const getPurchaseById = async (id: string): Promise<Purchase | null> => {
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: purchaseInclude,
  });

  return purchase ? mapPurchase(purchase) : null;
};

/**
 * Genera un número de factura automático basado en el año y contador secuencial
 */
const generateInvoiceNumber = async (tx: Prisma.TransactionClient): Promise<string> => {
  const currentYear = new Date().getFullYear();
  
  // Contar compras del año actual
  const purchasesCount = await tx.purchase.count({
    where: {
      purchaseDate: {
        gte: new Date(currentYear, 0, 1), // 1 de enero del año actual
        lte: new Date(currentYear, 11, 31, 23, 59, 59), // 31 de diciembre del año actual
      }
    }
  });
  
  const nextNumber = (purchasesCount + 1).toString().padStart(3, '0');
  return `F001-${currentYear}-${nextNumber}`;
};

/**
 * Crea una nueva compra completa incluyendo PurchaseItems, StockLots y StockMovements
 * usando una transacción para asegurar consistencia de datos.
 */
export const createPurchase = async (data: PurchaseFormData, userId: string): Promise<Purchase> => {
  // Preparar los datos para los items (convierte precio a Decimal)
  const purchaseItemsData: {
    productId: number;
    quantity: number;
    purchasePrice: Prisma.Decimal;
    loteId?: string | null;
    fechaVencimiento?: Date | null;
  }[] = data.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    purchasePrice: new Prisma.Decimal(item.purchasePrice),
    loteId: item.loteId,
    fechaVencimiento: item.fechaVencimiento ?? null,
  }));

  // Calcular el totalAmount basado en los items
  const totalAmount = purchaseItemsData.reduce<Prisma.Decimal>(
    (sum, item) => sum.add(item.purchasePrice.mul(item.quantity)),
    new Prisma.Decimal(0)
  );

  // Ejecutar todo dentro de una transacción
  const result = await prisma.$transaction(async (tx) => {
    // Generar invoiceNumber automático
    const invoiceNumber = await generateInvoiceNumber(tx);
    
    // a. Crear la Compra principal
    const newPurchase = await tx.purchase.create({
      data: {
        purchaseDate: data.purchaseDate,
        supplierId: data.supplierId,
        invoiceNumber: invoiceNumber, // Usar el número generado automáticamente
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        totalAmount: totalAmount,
        registeredById: userId,
        status: 'REGISTRADA', // Estado inicial
        // Crear los PurchaseItems anidados
        items: {
          create: purchaseItemsData,
        },
      },
      include: {
        items: true, // Incluir los items recién creados para obtener sus IDs
      },
    });

    // b. Por cada PurchaseItem creado, crear Lote y Movimiento
    for (const item of newPurchase.items) {
      // i. Crear el StockLot
      // Generar un loteId único (ej: LOTE-PurchaseID-ItemID)
      const loteIdentifier = `LOTE-${newPurchase.id}-${item.id}`;
      const newLot = await tx.stockLot.create({
        data: {
          loteId: loteIdentifier,
          productId: item.productId,
          quantity: item.quantity,
          originalQuantity: item.quantity,
          costPerUnit: item.purchasePrice,
          entryDate: newPurchase.purchaseDate, // Usar fecha de compra
          expiryDate: item.fechaVencimiento,
          status: LotStatus.ACTIVO, // Estado inicial del lote
          purchaseId: newPurchase.id,
          supplierId: newPurchase.supplierId,
        },
      });

      // ii. Crear el StockMovement (Entrada por Compra)
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          loteId: newLot.id, // ID CUID del StockLot recién creado
          quantity: item.quantity, // Cantidad positiva para entrada
          type: StockMovementType.ENTRADA,
          subType: StockMovementSubType.COMPRA,
          costPerUnit: item.purchasePrice,
          totalCost: item.purchasePrice.mul(item.quantity),
          referenceId: newPurchase.id, // ID de la compra
          date: newPurchase.purchaseDate,
          userId: userId,
        },
      });

      // iii. Actualizar el stock total del Producto (importante)
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // c. Volver a buscar la compra completa para devolverla con todas las relaciones
    const fullPurchase = await tx.purchase.findUniqueOrThrow({
      where: { id: newPurchase.id },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return fullPurchase;
  }); // Fin de la transacción

  // Mapear el resultado final al tipo esperado por el frontend
  return mapPurchase(result);
};

/**
 * Anula una compra y revierte todos los movimientos de inventario asociados
 * usando una transacción para asegurar consistencia de datos.
 */
export const annulPurchase = async (purchaseId: string, userId: string): Promise<Purchase> => {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Obtener la compra y sus lotes asociados
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { 
        supplier: true,
        items: { 
          include: { product: true } 
        },
        stockLots: true // Traer los lotes generados por esta compra
      },
    });

    if (!purchase) {
      throw new Error("Compra no encontrada.");
    }
    
    if (purchase.status === PurchaseStatus.ANULADA) {
      throw new Error("Esta compra ya ha sido anulada.");
    }

    // 2. Iterar sobre los lotes generados por esta compra
    for (const lot of purchase.stockLots) {
      // 3. VALIDACIÓN CRÍTICA: Solo permitimos anular si el stock del lote no ha sido tocado
      // (cantidad actual == original)
      if (lot.quantity !== lot.originalQuantity) {
        throw new Error(
          `No se puede anular: El lote ${lot.loteId} ya fue utilizado en ventas (Quedan ${lot.quantity}/${lot.originalQuantity}).`
        );
      }
      
      // 4. Revertir el stock del Producto
      await tx.product.update({
        where: { id: lot.productId },
        data: {
          stock: {
            decrement: lot.originalQuantity, // Restamos lo que sumamos
          },
        },
      });
      
      // 5. Crear el movimiento de stock de anulación (Salida)
      await tx.stockMovement.create({
        data: {
          productId: lot.productId,
          loteId: lot.id,
          quantity: -lot.originalQuantity, // Cantidad negativa (SALIDA)
          type: StockMovementType.SALIDA,
          subType: StockMovementSubType.ANULACION_VENTA, // Usar ANULACION_VENTA existente
          costPerUnit: lot.costPerUnit,
          totalCost: lot.costPerUnit.mul(lot.originalQuantity).negated(), // Costo negativo
          referenceId: purchase.id,
          date: new Date(),
          userId: userId,
        },
      });

      // 6. Actualizar el lote a ELIMINADO
      await tx.stockLot.update({
        where: { id: lot.id },
        data: {
          quantity: 0,
          status: LotStatus.ELIMINADO,
        },
      });
    }

    // 7. Finalmente, anular la Compra
    const anulatedPurchase = await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        status: PurchaseStatus.ANULADA,
      },
      include: {
        supplier: true,
        items: { 
          include: { product: true } 
        },
      },
    });

    return anulatedPurchase;
  }); // Fin de la transacción

  // 8. Mapear y devolver
  return mapPurchase(result);
};
import prisma from '../utils/prisma.js';
import { CashMovementWithRelations, CreateManualMovementInput, UpdateManualMovementInput } from '@mi-tienda/types';
import { Prisma, CashMovementType, PaymentMethod } from '@prisma/client';

// Definir tipo para los resultados de Prisma con relaciones incluidas
type PrismaCashMovementWithRelations = Prisma.CashMovementGetPayload<{
  include: {
    user: true;
  };
}>;

// Helper para mapear movimientos de caja de Prisma a un formato más amigable
const mapCashMovementFromPrisma = (movement: PrismaCashMovementWithRelations): CashMovementWithRelations => {
  return {
    id: movement.id,
    type: movement.type,
    amount: movement.amount,
    category: movement.category,
    description: movement.description,
    paymentMethod: movement.paymentMethod,
    referenceId: movement.referenceId,
    date: movement.date,
    previousBalance: movement.previousBalance,
    newBalance: movement.newBalance,
    userId: movement.userId,
    user: {
      id: movement.user.id,
      email: movement.user.email,
      name: movement.user.name,
      role: movement.user.role,
    },
    createdAt: movement.createdAt,
  };
};

// Configuración de include para consultas con relaciones
const cashMovementInclude = {
  user: true,
} as const;

export class CashService {
  async getCashMovements(): Promise<CashMovementWithRelations[]> {
    const movements = await prisma.cashMovement.findMany({
      include: cashMovementInclude,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return movements.map(mapCashMovementFromPrisma);
  }

  async createManualMovement(data: CreateManualMovementInput, userId: string): Promise<CashMovementWithRelations> {
    return await prisma.$transaction(async (tx) => {
      // Obtener el último movimiento para calcular el saldo anterior
      const lastMovement = await tx.cashMovement.findFirst({
        orderBy: { date: 'desc' },
      });

      const previousBalance = lastMovement ? lastMovement.newBalance : new Prisma.Decimal(0);
      
      // Calcular el monto del movimiento (positivo para entradas, negativo para salidas)
      const movementAmount = data.type === 'SALIDA'
        ? new Prisma.Decimal(data.amount).negated()
        : new Prisma.Decimal(data.amount);
      
      // Calcular el nuevo saldo
      const newBalance = previousBalance.plus(movementAmount);

      // Crear el movimiento manual
      const newMovement = await tx.cashMovement.create({
        data: {
          type: data.type as CashMovementType,
          amount: movementAmount,
          previousBalance: previousBalance,
          newBalance: newBalance,
          userId: userId,
          referenceId: null, // Marca como movimiento manual
          date: new Date(data.date),
          description: data.description,
          category: data.category,
          paymentMethod: data.paymentMethod as PaymentMethod,
        },
        include: cashMovementInclude,
      });

      return mapCashMovementFromPrisma(newMovement);
    });
  }

  async updateManualMovement(id: string, data: UpdateManualMovementInput): Promise<CashMovementWithRelations> {
    // Solo permitimos actualizar campos no financieros para no romper la cadena de saldos
    const updateData: any = {
      description: data.description,
      category: data.category,
    };

    // Solo incluir paymentMethod si se proporciona
    if (data.paymentMethod !== undefined) {
      updateData.paymentMethod = data.paymentMethod as PaymentMethod;
    }

    const updatedMovement = await prisma.cashMovement.update({
      where: { id },
      data: updateData,
      include: cashMovementInclude,
    });

    return mapCashMovementFromPrisma(updatedMovement);
  }

  async deleteManualMovement(id: string): Promise<void> {
    // Restricción arquitectónica: No permitimos el borrado para mantener la integridad del saldo
    throw new Error('La eliminación de movimientos no está permitida para mantener la integridad del saldo.');
  }
}
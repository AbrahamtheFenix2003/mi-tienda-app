import prisma from '../utils/prisma.js';
import { CashMovementWithRelations } from '@mi-tienda/types';
import { Prisma } from '@prisma/client';

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
}
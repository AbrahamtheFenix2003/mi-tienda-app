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
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    return movements.map(mapCashMovementFromPrisma);
  }

  async createManualMovement(data: CreateManualMovementInput, userId: string): Promise<CashMovementWithRelations> {
    return await prisma.$transaction(async (tx) => {
      // Lógica corregida para detección de fechas y desempate temporal
      const now = new Date();

      // 1. Obtener la fecha actual en Perú como string "YYYY-MM-DD"
      const peruFormatter = new Intl.DateTimeFormat('en-CA', { // en-CA usa formato ISO YYYY-MM-DD
        timeZone: 'America/Lima',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      const todayPeru = peruFormatter.format(now);

      // 2. Obtener la fecha del input como string "YYYY-MM-DD"
      // Evitamos crear un objeto Date primero para no sufrir el desfase de zona horaria (UTC-5)
      const inputDateString = typeof data.date === 'string' 
        ? data.date.split('T')[0] 
        : new Date(data.date).toISOString().split('T')[0];

      const isToday = inputDateString === todayPeru;

      // Parseamos la fecha de entrada una sola vez
      const parsedInputDate = new Date(data.date);

      // Detectamos si el input original era solo una fecha (ej. "YYYY-MM-DD")
      // Esto es un buen proxy para saber si el usuario especificó una hora o no.
      const isDateOnlyInput = typeof data.date === 'string' && data.date.length === 10;
      
      let movementDate: Date;
      if (isToday) {
        if (isDateOnlyInput) {
          // Si es hoy y el input fue solo fecha, usamos la hora actual (comportamiento actual deseado para "registrar ahora")
          movementDate = now;
        } else {
          // Si es hoy y el input incluía una hora específica, respetamos esa hora
          movementDate = parsedInputDate;
        }
      } else {
        // Si no es hoy, siempre respetamos la fecha y hora del input
        movementDate = parsedInputDate;
      }

      // 4. Lógica de Desempate Temporal (Solo si es hoy)
      // Si hay una compra u otro movimiento registrado en este preciso instante,
      // empujamos este movimiento 1 segundo adelante para asegurar que sea el último.
      if (isToday) {
        const lastRegisteredMovement = await tx.cashMovement.findFirst({
          where: {
            date: {
              // CRÍTICO: Solo buscamos conflictos con movimientos que hayan ocurrido hasta AHORA.
              // Si existe un movimiento futuro (ej. año 2030 por error), lo ignoramos para no
              // "teletransportar" este movimiento al futuro.
              lte: new Date(now.getTime() + 60000) // +1 minuto de margen de seguridad
            }
          },
          orderBy: { date: 'desc' }
        });

        if (lastRegisteredMovement && lastRegisteredMovement.date >= movementDate) {
          movementDate = new Date(lastRegisteredMovement.date.getTime() + 1000);
        }
      }
      
      // Obtener el movimiento inmediatamente anterior en fecha
      const previousMovement = await tx.cashMovement.findFirst({
        where: {
          date: {
            lt: movementDate,
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      const previousBalance = previousMovement ? previousMovement.newBalance : new Prisma.Decimal(0);
      
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
          date: movementDate,
          description: data.description,
          category: data.category,
          paymentMethod: data.paymentMethod as PaymentMethod,
        },
        include: cashMovementInclude,
      });

      // Recalcular saldos de todos los movimientos posteriores
      const subsequentMovements = await tx.cashMovement.findMany({
        where: {
          date: {
            gte: movementDate,
          },
          id: {
            not: newMovement.id,
          },
        },
        orderBy: [
          { date: 'asc' },
          { createdAt: 'asc' }
        ],
      });

      let runningBalance = newBalance;
      for (const movement of subsequentMovements) {
        const prevBalance = runningBalance;
        runningBalance = prevBalance.plus(movement.amount);

        await tx.cashMovement.update({
          where: { id: movement.id },
          data: {
            previousBalance: prevBalance,
            newBalance: runningBalance,
          },
        });
      }

      return mapCashMovementFromPrisma(newMovement);
    });
  }

  async updateManualMovement(id: string, data: UpdateManualMovementInput): Promise<CashMovementWithRelations> {
    return await prisma.$transaction(async (tx) => {
      // Obtener el movimiento actual
      const currentMovement = await tx.cashMovement.findUnique({
        where: { id },
      });

      if (!currentMovement) {
        throw new Error('Movimiento no encontrado');
      }

      // Preparar datos de actualización
      const updateData: any = {};

      if (data.description !== undefined) {
        updateData.description = data.description;
      }

      if (data.category !== undefined) {
        updateData.category = data.category;
      }

      if (data.paymentMethod !== undefined) {
        updateData.paymentMethod = data.paymentMethod as PaymentMethod;
      }

      if (data.date !== undefined) {
        updateData.date = new Date(data.date);
      }

      if (data.type !== undefined) {
        updateData.type = data.type as CashMovementType;
      }

      // Si se actualiza el monto o el tipo, recalcular saldos
      if (data.amount !== undefined || data.type !== undefined) {
        const newType = (data.type as CashMovementType | undefined) || currentMovement.type;
        const newAmount = data.amount !== undefined ? new Prisma.Decimal(data.amount) : currentMovement.amount.abs();

        // Calcular el monto del movimiento (positivo para entradas, negativo para salidas)
        const movementAmount = newType === 'SALIDA'
          ? newAmount.negated()
          : newAmount;

        updateData.amount = movementAmount;

        // Obtener el saldo anterior (del movimiento inmediatamente anterior en fecha)
        const previousMovement = await tx.cashMovement.findFirst({
          where: {
            date: {
              lt: currentMovement.date,
            },
          },
          orderBy: {
            date: 'desc',
          },
        });

        const previousBalance = previousMovement ? previousMovement.newBalance : new Prisma.Decimal(0);
        const newBalance = previousBalance.plus(movementAmount);

        updateData.newBalance = newBalance;
        updateData.previousBalance = previousBalance;

        // Actualizar el movimiento
        const updatedMovement = await tx.cashMovement.update({
          where: { id },
          data: updateData,
          include: cashMovementInclude,
        });

        // Recalcular saldos de todos los movimientos posteriores
        const subsequentMovements = await tx.cashMovement.findMany({
          where: {
            date: {
              gte: currentMovement.date,
            },
            id: {
              not: updatedMovement.id,
            },
          },
          orderBy: [
            { date: 'asc' },
            { createdAt: 'asc' }
          ],
        });

        let runningBalance = newBalance;
        for (const movement of subsequentMovements) {
          const prevBalance = runningBalance;
          runningBalance = prevBalance.plus(movement.amount);

          await tx.cashMovement.update({
            where: { id: movement.id },
            data: {
              previousBalance: prevBalance,
              newBalance: runningBalance,
            },
          });
        }

        return mapCashMovementFromPrisma(updatedMovement);
      } else {
        // Si no se actualiza el monto ni el tipo, solo actualizar los campos no financieros
        const updatedMovement = await tx.cashMovement.update({
          where: { id },
          data: updateData,
          include: cashMovementInclude,
        });

        return mapCashMovementFromPrisma(updatedMovement);
      }
    });
  }

  async deleteManualMovement(id: string): Promise<void> {
    return await prisma.$transaction(async (tx) => {
      // Obtener el movimiento a eliminar
      const movement = await tx.cashMovement.findUnique({
        where: { id },
      });

      if (!movement) {
        throw new Error('Movimiento no encontrado');
      }

      // Verificar que sea un movimiento manual (referenceId debe ser null)
      if (movement.referenceId !== null) {
        throw new Error('Solo se pueden eliminar movimientos manuales');
      }

      // Eliminar el movimiento
      await tx.cashMovement.delete({
        where: { id },
      });

      // Recalcular saldos de todos los movimientos posteriores
      const subsequentMovements = await tx.cashMovement.findMany({
        where: {
          date: {
            gte: movement.date,
          },
          id: {
            not: movement.id,
          },
        },
        orderBy: [
          { date: 'asc' },
          { createdAt: 'asc' }
        ],
      });

      // Obtener el último saldo válido antes del movimiento eliminado
      const previousMovement = await tx.cashMovement.findFirst({
        where: {
          date: {
            lt: movement.date,
          },
        },
        orderBy: {
          date: 'desc',
        },
      });

      let runningBalance = previousMovement ? previousMovement.newBalance : new Prisma.Decimal(0);

      // Recalcular saldos
      for (const mov of subsequentMovements) {
        const prevBalance = runningBalance;
        runningBalance = prevBalance.plus(mov.amount);

        await tx.cashMovement.update({
          where: { id: mov.id },
          data: {
            previousBalance: prevBalance,
            newBalance: runningBalance,
          },
        });
      }
    });
  }

  /**
   * Elimina un movimiento de caja específico y recalcula todos los saldos posteriores
   * Usado para anulación de ventas/compras donde se quiere eliminar completamente el movimiento original
   */
  async deleteCashMovementAndRecalculate(referenceId: string): Promise<void> {
    return await prisma.$transaction(async (tx) => {
      // Buscar el movimiento de caja asociado a la venta/compra
      const movementToDelete = await tx.cashMovement.findFirst({
        where: { referenceId }
      });

      if (!movementToDelete) {
        // No hay movimiento de caja asociado, no hacer nada
        return;
      }

      // Eliminar el movimiento de caja
      await tx.cashMovement.delete({
        where: { id: movementToDelete.id }
      });

      // Recalcular saldos de todos los movimientos posteriores
      const subsequentMovements = await tx.cashMovement.findMany({
        where: {
          date: {
            gte: movementToDelete.date
          },
          id: {
            not: movementToDelete.id
          }
        },
        orderBy: [
          { date: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      // Obtener el último saldo válido antes del movimiento eliminado
      const previousMovement = await tx.cashMovement.findFirst({
        where: {
          date: {
            lt: movementToDelete.date
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
    });
  }
}
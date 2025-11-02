import { CashMovement } from '@prisma/client';
import { User } from './user.js';
import { z } from 'zod';

export type CashMovementWithRelations = CashMovement & {
  user: User;
};

// Esquema Zod para movimientos manuales de caja
export const manualMovementSchema = z.object({
  description: z.string().min(3, { message: 'Descripción requerida' }),
  amount: z.number().positive({ message: 'El monto debe ser positivo' }),
  type: z.enum(['ENTRADA', 'SALIDA'], { message: 'Tipo requerido' }),
  category: z.string().min(3, { message: 'Categoría requerida' }),
  date: z.string().datetime({ message: 'Fecha inválida' }),
  paymentMethod: z.nativeEnum(
    { YAPE: 'YAPE', PLIN: 'PLIN', EFECTIVO: 'EFECTIVO', TRANSFERENCIA: 'TRANSFERENCIA', CHEQUE: 'CHEQUE', CREDITO: 'CREDITO' },
    { message: 'Método de pago requerido' }
  ),
});

// Tipos inferidos del esquema Zod
export type CreateManualMovementInput = z.infer<typeof manualMovementSchema>;
export type UpdateManualMovementInput = Partial<z.infer<typeof manualMovementSchema>>;
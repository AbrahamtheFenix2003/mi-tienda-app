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
  date: z.string().refine(
    (val) => {
      // Acepta formato YYYY-MM-DD o ISO 8601 completo
      const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
      const iso8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      return dateOnly.test(val) || iso8601.test(val);
    },
    { message: 'Fecha inválida. Use formato YYYY-MM-DD' }
  ),
  paymentMethod: z.nativeEnum(
    { YAPE: 'YAPE', PLIN: 'PLIN', EFECTIVO: 'EFECTIVO', TRANSFERENCIA: 'TRANSFERENCIA', CHEQUE: 'CHEQUE', CREDITO: 'CREDITO' },
    { message: 'Método de pago requerido' }
  ),
});

// Tipos inferidos del esquema Zod
export type CreateManualMovementInput = z.infer<typeof manualMovementSchema>;
export type UpdateManualMovementInput = Partial<z.infer<typeof manualMovementSchema>>;
import { CashMovement } from '@prisma/client';
import { User } from './user.js';

export type CashMovementWithRelations = CashMovement & {
  user: User;
};
import { CashMovementType, Prisma } from '@prisma/client';

type CashMovementAmountLike = {
  type: CashMovementType | string;
  amount: Prisma.Decimal | number | string;
};

export const getSignedCashMovementAmount = ({ type, amount }: CashMovementAmountLike): Prisma.Decimal => {
  const normalizedAmount = new Prisma.Decimal(amount).abs();

  return type === CashMovementType.SALIDA
    ? normalizedAmount.negated()
    : normalizedAmount;
};

export const applyCashMovementToBalance = (
  currentBalance: Prisma.Decimal,
  movement: CashMovementAmountLike,
): Prisma.Decimal => {
  return currentBalance.plus(getSignedCashMovementAmount(movement));
};

/*
  Warnings:

  - You are about to drop the column `stockMaximo` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stockMinimo` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "stockMaximo",
DROP COLUMN "stockMinimo";

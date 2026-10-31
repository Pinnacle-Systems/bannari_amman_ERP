/*
  Warnings:

  - You are about to drop the column `isYarnUom` on the `Uom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Uom" DROP COLUMN "isYarnUom",
ADD COLUMN     "isFabricUom" BOOLEAN DEFAULT false;

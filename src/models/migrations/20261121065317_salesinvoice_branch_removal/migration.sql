/*
  Warnings:

  - You are about to drop the column `salesBranchId` on the `SalesInvoice` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SalesInvoice" DROP CONSTRAINT "SalesInvoice_salesBranchId_fkey";

-- AlterTable
ALTER TABLE "SalesInvoice" DROP COLUMN "salesBranchId";

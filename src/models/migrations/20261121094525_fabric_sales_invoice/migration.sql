/*
  Warnings:

  - You are about to drop the column `salesInvoiceId` on the `SalesFabricItems` table. All the data in the column will be lost.
  - Added the required column `fabricSalesInvoiceId` to the `SalesFabricItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SalesFabricItems" DROP CONSTRAINT "SalesFabricItems_salesInvoiceId_fkey";

-- AlterTable
ALTER TABLE "SalesFabricItems" DROP COLUMN "salesInvoiceId",
ADD COLUMN     "fabricSalesInvoiceId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "fabricSalesInvoiceId" INTEGER;

-- CreateTable
CREATE TABLE "FabricSalesInvoice" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "finYearId" INTEGER,
    "companyId" INTEGER,
    "customerId" INTEGER,
    "orderType" TEXT,
    "orderGridType" TEXT,
    "customerPoNo" TEXT,
    "remarks" TEXT,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "taxTemplateId" INTEGER,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "payTermId" INTEGER,
    "bankId" INTEGER,
    "currencyId" INTEGER,
    "carriageCharge" DOUBLE PRECISION,
    "carriageTax" DOUBLE PRECISION,
    "loadingId" INTEGER,
    "deliveryId" INTEGER,
    "netTotalAmount" DOUBLE PRECISION,

    CONSTRAINT "FabricSalesInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FabricSalesInvoice_docId_key" ON "FabricSalesInvoice"("docId");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_fabricSalesInvoiceId_fkey" FOREIGN KEY ("fabricSalesInvoiceId") REFERENCES "FabricSalesInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_fabricSalesInvoiceId_fkey" FOREIGN KEY ("fabricSalesInvoiceId") REFERENCES "FabricSalesInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "ProformaAttachments" ADD COLUMN     "proformaInvoiceYarnId" INTEGER;

-- AlterTable
ALTER TABLE "ProformaInvoiceItem" ADD COLUMN     "proformaInvoiceYarnId" INTEGER;

-- CreateTable
CREATE TABLE "ProformaInvoiceYarn" (
    "id" SERIAL NOT NULL,
    "docId" TEXT NOT NULL,
    "docDate" TIMESTAMP(3),
    "userDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "branchId" INTEGER,
    "companyId" INTEGER,
    "customerId" INTEGER,
    "finYearId" INTEGER,
    "remarks" TEXT,
    "termsAndCondition" TEXT,
    "termsId" INTEGER,
    "taxTemplateId" INTEGER,
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "payTermId" INTEGER,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvalStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "validityTo" TIMESTAMP(3),
    "currencyId" INTEGER,
    "weightInKg" DOUBLE PRECISION,
    "loadingId" INTEGER,
    "deliveryId" INTEGER,
    "carriageCharge" DOUBLE PRECISION,
    "carriageTax" DOUBLE PRECISION,
    "bankId" INTEGER,
    "conversionType" TEXT,
    "customerPoNo" TEXT,

    CONSTRAINT "ProformaInvoiceYarn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnItems" (
    "id" SERIAL NOT NULL,
    "proformaInvoiceYarnId" INTEGER NOT NULL,
    "yarnId" INTEGER,
    "hsnId" INTEGER,
    "contentId" INTEGER,
    "countsId" INTEGER,
    "colorId" INTEGER,
    "uomId" INTEGER,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "YarnItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProformaInvoiceYarn_docId_key" ON "ProformaInvoiceYarn"("docId");

-- AddForeignKey
ALTER TABLE "ProformaInvoiceItem" ADD CONSTRAINT "ProformaInvoiceItem_proformaInvoiceYarnId_fkey" FOREIGN KEY ("proformaInvoiceYarnId") REFERENCES "ProformaInvoiceYarn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaAttachments" ADD CONSTRAINT "ProformaAttachments_proformaInvoiceYarnId_fkey" FOREIGN KEY ("proformaInvoiceYarnId") REFERENCES "ProformaInvoiceYarn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProformaInvoiceYarn" ADD CONSTRAINT "ProformaInvoiceYarn_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnItems" ADD CONSTRAINT "YarnItems_proformaInvoiceYarnId_fkey" FOREIGN KEY ("proformaInvoiceYarnId") REFERENCES "ProformaInvoiceYarn"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnItems" ADD CONSTRAINT "YarnItems_yarnId_fkey" FOREIGN KEY ("yarnId") REFERENCES "YarnMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnItems" ADD CONSTRAINT "YarnItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnItems" ADD CONSTRAINT "YarnItems_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnItems" ADD CONSTRAINT "YarnItems_countsId_fkey" FOREIGN KEY ("countsId") REFERENCES "CountsMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnItems" ADD CONSTRAINT "YarnItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnItems" ADD CONSTRAINT "YarnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

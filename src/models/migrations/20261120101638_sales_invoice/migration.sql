-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "salesInvoiceId" INTEGER;

-- CreateTable
CREATE TABLE "SalesInvoice" (
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
    "salesBranchId" INTEGER,
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

    CONSTRAINT "SalesInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesFabricItems" (
    "id" SERIAL NOT NULL,
    "salesInvoiceId" INTEGER NOT NULL,
    "fabricId" INTEGER,
    "hsnId" INTEGER,
    "colorId" INTEGER,
    "designId" INTEGER,
    "gaugeId" INTEGER,
    "loopLengthId" INTEGER,
    "gsmId" INTEGER,
    "kDiaId" INTEGER,
    "fDiaId" INTEGER,
    "uomId" INTEGER,
    "width" TEXT,
    "numberOfRolls" DOUBLE PRECISION,
    "weightPerRoll" DOUBLE PRECISION,
    "totalKgs" DOUBLE PRECISION,
    "pricePerKg" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,

    CONSTRAINT "SalesFabricItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesYarnItems" (
    "id" SERIAL NOT NULL,
    "salesInvoiceId" INTEGER NOT NULL,
    "yarnId" INTEGER,
    "hsnId" INTEGER,
    "contentId" INTEGER,
    "countsId" INTEGER,
    "colorId" INTEGER,
    "uomId" INTEGER,
    "noOfbags" INTEGER,
    "weightPerBag" DOUBLE PRECISION,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,

    CONSTRAINT "SalesYarnItems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesInvoice_docId_key" ON "SalesInvoice"("docId");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_salesInvoiceId_fkey" FOREIGN KEY ("salesInvoiceId") REFERENCES "SalesInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_salesBranchId_fkey" FOREIGN KEY ("salesBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_termsId_fkey" FOREIGN KEY ("termsId") REFERENCES "TermsAndConditions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_taxTemplateId_fkey" FOREIGN KEY ("taxTemplateId") REFERENCES "TaxTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_payTermId_fkey" FOREIGN KEY ("payTermId") REFERENCES "PayTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_loadingId_fkey" FOREIGN KEY ("loadingId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_salesInvoiceId_fkey" FOREIGN KEY ("salesInvoiceId") REFERENCES "SalesInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "FabricMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_designId_fkey" FOREIGN KEY ("designId") REFERENCES "DesignMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_gaugeId_fkey" FOREIGN KEY ("gaugeId") REFERENCES "Gauge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_loopLengthId_fkey" FOREIGN KEY ("loopLengthId") REFERENCES "LoopLength"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_kDiaId_fkey" FOREIGN KEY ("kDiaId") REFERENCES "DiaMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_fDiaId_fkey" FOREIGN KEY ("fDiaId") REFERENCES "DiaMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesFabricItems" ADD CONSTRAINT "SalesFabricItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesYarnItems" ADD CONSTRAINT "SalesYarnItems_salesInvoiceId_fkey" FOREIGN KEY ("salesInvoiceId") REFERENCES "SalesInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesYarnItems" ADD CONSTRAINT "SalesYarnItems_yarnId_fkey" FOREIGN KEY ("yarnId") REFERENCES "YarnMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesYarnItems" ADD CONSTRAINT "SalesYarnItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesYarnItems" ADD CONSTRAINT "SalesYarnItems_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesYarnItems" ADD CONSTRAINT "SalesYarnItems_countsId_fkey" FOREIGN KEY ("countsId") REFERENCES "CountsMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesYarnItems" ADD CONSTRAINT "SalesYarnItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesYarnItems" ADD CONSTRAINT "SalesYarnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

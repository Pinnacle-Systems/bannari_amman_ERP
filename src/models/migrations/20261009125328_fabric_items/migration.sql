-- AlterTable
ALTER TABLE "ProformaInvoice" ADD COLUMN     "customerPoNo" TEXT;

-- CreateTable
CREATE TABLE "FabricItems" (
    "id" SERIAL NOT NULL,
    "proformaInvoiceId" INTEGER NOT NULL,
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
    "pricePerKg" DOUBLE PRECISION,
    "qty" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "taxPercent" DOUBLE PRECISION,
    "discountType" TEXT,
    "discountValue" DOUBLE PRECISION,
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "FabricItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_proformaInvoiceId_fkey" FOREIGN KEY ("proformaInvoiceId") REFERENCES "ProformaInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "FabricMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_designId_fkey" FOREIGN KEY ("designId") REFERENCES "DesignMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_gaugeId_fkey" FOREIGN KEY ("gaugeId") REFERENCES "Gauge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_loopLengthId_fkey" FOREIGN KEY ("loopLengthId") REFERENCES "LoopLength"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_kDiaId_fkey" FOREIGN KEY ("kDiaId") REFERENCES "DiaMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_fDiaId_fkey" FOREIGN KEY ("fDiaId") REFERENCES "DiaMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricItems" ADD CONSTRAINT "FabricItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Po" ADD COLUMN     "orderGridType" TEXT;

-- CreateTable
CREATE TABLE "PoFabricItems" (
    "id" SERIAL NOT NULL,
    "poId" INTEGER,
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
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PoFabricItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoYarnItems" (
    "id" SERIAL NOT NULL,
    "poId" INTEGER,
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
    "quoteVersion" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PoYarnItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "FabricMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_designId_fkey" FOREIGN KEY ("designId") REFERENCES "DesignMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_gaugeId_fkey" FOREIGN KEY ("gaugeId") REFERENCES "Gauge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_loopLengthId_fkey" FOREIGN KEY ("loopLengthId") REFERENCES "LoopLength"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_kDiaId_fkey" FOREIGN KEY ("kDiaId") REFERENCES "DiaMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_fDiaId_fkey" FOREIGN KEY ("fDiaId") REFERENCES "DiaMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoFabricItems" ADD CONSTRAINT "PoFabricItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoYarnItems" ADD CONSTRAINT "PoYarnItems_poId_fkey" FOREIGN KEY ("poId") REFERENCES "Po"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoYarnItems" ADD CONSTRAINT "PoYarnItems_yarnId_fkey" FOREIGN KEY ("yarnId") REFERENCES "YarnMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoYarnItems" ADD CONSTRAINT "PoYarnItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoYarnItems" ADD CONSTRAINT "PoYarnItems_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoYarnItems" ADD CONSTRAINT "PoYarnItems_countsId_fkey" FOREIGN KEY ("countsId") REFERENCES "CountsMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoYarnItems" ADD CONSTRAINT "PoYarnItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoYarnItems" ADD CONSTRAINT "PoYarnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

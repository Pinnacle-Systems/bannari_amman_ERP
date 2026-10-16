/*
  Warnings:

  - You are about to drop the column `conversionType` on the `OrderEntry` table. All the data in the column will be lost.
  - You are about to drop the column `isRepeatedPI` on the `OrderEntry` table. All the data in the column will be lost.
  - You are about to drop the column `orderQty` on the `OrderEntry` table. All the data in the column will be lost.
  - You are about to drop the column `proFormaId` on the `OrderEntry` table. All the data in the column will be lost.
  - You are about to drop the column `productionType` on the `OrderEntry` table. All the data in the column will be lost.
  - You are about to drop the column `refNo` on the `OrderEntry` table. All the data in the column will be lost.
  - You are about to drop the column `validDays` on the `OrderEntry` table. All the data in the column will be lost.
  - You are about to drop the column `validTo` on the `OrderEntry` table. All the data in the column will be lost.
  - You are about to drop the column `weightInKg` on the `OrderEntry` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderEntry" DROP CONSTRAINT "OrderEntry_proFormaId_fkey";

-- AlterTable
ALTER TABLE "OrderEntry" DROP COLUMN "conversionType",
DROP COLUMN "isRepeatedPI",
DROP COLUMN "orderQty",
DROP COLUMN "proFormaId",
DROP COLUMN "productionType",
DROP COLUMN "refNo",
DROP COLUMN "validDays",
DROP COLUMN "validTo",
DROP COLUMN "weightInKg",
ADD COLUMN     "orderGridType" TEXT,
ADD COLUMN     "proFormaFabricId" INTEGER,
ADD COLUMN     "proFormaYarnId" INTEGER;

-- CreateTable
CREATE TABLE "OrderYarnItems" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
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

    CONSTRAINT "OrderYarnItems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderFabricItems" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
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

    CONSTRAINT "OrderFabricItems_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_proFormaFabricId_fkey" FOREIGN KEY ("proFormaFabricId") REFERENCES "ProformaInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_proFormaYarnId_fkey" FOREIGN KEY ("proFormaYarnId") REFERENCES "ProformaInvoiceYarn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderYarnItems" ADD CONSTRAINT "OrderYarnItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderYarnItems" ADD CONSTRAINT "OrderYarnItems_yarnId_fkey" FOREIGN KEY ("yarnId") REFERENCES "YarnMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderYarnItems" ADD CONSTRAINT "OrderYarnItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderYarnItems" ADD CONSTRAINT "OrderYarnItems_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderYarnItems" ADD CONSTRAINT "OrderYarnItems_countsId_fkey" FOREIGN KEY ("countsId") REFERENCES "CountsMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderYarnItems" ADD CONSTRAINT "OrderYarnItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderYarnItems" ADD CONSTRAINT "OrderYarnItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_fabricId_fkey" FOREIGN KEY ("fabricId") REFERENCES "FabricMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_designId_fkey" FOREIGN KEY ("designId") REFERENCES "DesignMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_gaugeId_fkey" FOREIGN KEY ("gaugeId") REFERENCES "Gauge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_loopLengthId_fkey" FOREIGN KEY ("loopLengthId") REFERENCES "LoopLength"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_gsmId_fkey" FOREIGN KEY ("gsmId") REFERENCES "Gsm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_kDiaId_fkey" FOREIGN KEY ("kDiaId") REFERENCES "DiaMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_fDiaId_fkey" FOREIGN KEY ("fDiaId") REFERENCES "DiaMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderFabricItems" ADD CONSTRAINT "OrderFabricItems_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "OrderFabricItems" ADD COLUMN     "requiredQty" DOUBLE PRECISION,
ADD COLUMN     "wastePercentage" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "FabricYarnDetails" (
    "id" SERIAL NOT NULL,
    "orderFabricItemsId" INTEGER NOT NULL,
    "rowId" TEXT,
    "yarnId" INTEGER,
    "colorId" INTEGER,
    "percentage" DOUBLE PRECISION,
    "yarnQty" DOUBLE PRECISION,
    "process" TEXT,

    CONSTRAINT "FabricYarnDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnProcessDetails" (
    "id" SERIAL NOT NULL,
    "FabricYarnDetailsId" INTEGER NOT NULL,
    "rowId" TEXT,
    "processId" INTEGER,
    "lossPercentage" DOUBLE PRECISION,
    "dyeing" TEXT,

    CONSTRAINT "YarnProcessDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnProcessColors" (
    "id" SERIAL NOT NULL,
    "yarnProcessDetailsId" INTEGER NOT NULL,
    "rowId" TEXT,
    "colorId" INTEGER,
    "yarnProPercentage" DOUBLE PRECISION,

    CONSTRAINT "YarnProcessColors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FabricProcess" (
    "id" SERIAL NOT NULL,
    "orderFabricItemsId" INTEGER NOT NULL,
    "rowId" TEXT,
    "processId" INTEGER,
    "description" TEXT,

    CONSTRAINT "FabricProcess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FabricYarnDetails" ADD CONSTRAINT "FabricYarnDetails_orderFabricItemsId_fkey" FOREIGN KEY ("orderFabricItemsId") REFERENCES "OrderFabricItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricYarnDetails" ADD CONSTRAINT "FabricYarnDetails_yarnId_fkey" FOREIGN KEY ("yarnId") REFERENCES "YarnMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricYarnDetails" ADD CONSTRAINT "FabricYarnDetails_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnProcessDetails" ADD CONSTRAINT "YarnProcessDetails_FabricYarnDetailsId_fkey" FOREIGN KEY ("FabricYarnDetailsId") REFERENCES "FabricYarnDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnProcessDetails" ADD CONSTRAINT "YarnProcessDetails_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnProcessColors" ADD CONSTRAINT "YarnProcessColors_yarnProcessDetailsId_fkey" FOREIGN KEY ("yarnProcessDetailsId") REFERENCES "YarnProcessDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnProcessColors" ADD CONSTRAINT "YarnProcessColors_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricProcess" ADD CONSTRAINT "FabricProcess_orderFabricItemsId_fkey" FOREIGN KEY ("orderFabricItemsId") REFERENCES "OrderFabricItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricProcess" ADD CONSTRAINT "FabricProcess_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

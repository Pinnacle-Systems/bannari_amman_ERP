-- AlterTable
ALTER TABLE "OrderYarnItems" ADD COLUMN     "requiredQty" DOUBLE PRECISION,
ADD COLUMN     "wastePercentage" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "YarnOrderProcess" (
    "id" SERIAL NOT NULL,
    "orderYarnItemsId" INTEGER NOT NULL,
    "rowId" TEXT,
    "processId" INTEGER,
    "colorId" INTEGER,

    CONSTRAINT "YarnOrderProcess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "YarnOrderProcess" ADD CONSTRAINT "YarnOrderProcess_orderYarnItemsId_fkey" FOREIGN KEY ("orderYarnItemsId") REFERENCES "OrderYarnItems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnOrderProcess" ADD CONSTRAINT "YarnOrderProcess_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnOrderProcess" ADD CONSTRAINT "YarnOrderProcess_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

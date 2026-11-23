-- AlterTable
ALTER TABLE "FabricSalesInvoice" ADD COLUMN     "customerDeliveryId" INTEGER,
ADD COLUMN     "vehicleNo" TEXT;

-- AlterTable
ALTER TABLE "SalesInvoice" ADD COLUMN     "customerDeliveryId" INTEGER,
ADD COLUMN     "vehicleNo" TEXT;

-- AddForeignKey
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_customerDeliveryId_fkey" FOREIGN KEY ("customerDeliveryId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricSalesInvoice" ADD CONSTRAINT "FabricSalesInvoice_customerDeliveryId_fkey" FOREIGN KEY ("customerDeliveryId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

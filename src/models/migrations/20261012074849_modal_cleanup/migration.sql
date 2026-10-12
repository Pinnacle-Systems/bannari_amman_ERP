/*
  Warnings:

  - You are about to drop the `Board` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BoardQuality` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Die` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinishingProcess` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IncomingQty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LabelPrintingDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LaminationDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MachineDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MobileNotification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderSizeBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderStyleBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PISizeBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PIStyleBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackingBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackingSizeBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackingStyleBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Plate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PlateDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrintingDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Process` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcessDetails` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcessGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcessGroupList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReworkBatchTracker` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReworkLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaleBillEntrySizeBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaleBillEntryStyleBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaleOrderSizeBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaleOrderStyleBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesDeliveryPacking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesOrderPacking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesReturnSizeBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesReturnStyleBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesSizeBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesStyleBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Style` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VarnishDetails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BillingProcess" DROP CONSTRAINT "BillingProcess_processId_fkey";

-- DropForeignKey
ALTER TABLE "Board" DROP CONSTRAINT "Board_companyId_fkey";

-- DropForeignKey
ALTER TABLE "BoardQuality" DROP CONSTRAINT "BoardQuality_boardId_fkey";

-- DropForeignKey
ALTER TABLE "BoardQuality" DROP CONSTRAINT "BoardQuality_fullBoardId_fkey";

-- DropForeignKey
ALTER TABLE "BoardQuality" DROP CONSTRAINT "BoardQuality_gsmId_fkey";

-- DropForeignKey
ALTER TABLE "BoardQuality" DROP CONSTRAINT "BoardQuality_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "BoardQuality" DROP CONSTRAINT "BoardQuality_processId_fkey";

-- DropForeignKey
ALTER TABLE "DeliveryChallanItems" DROP CONSTRAINT "DeliveryChallanItems_styleId_fkey";

-- DropForeignKey
ALTER TABLE "DeliveryInvoiceItems" DROP CONSTRAINT "DeliveryInvoiceItems_styleId_fkey";

-- DropForeignKey
ALTER TABLE "Die" DROP CONSTRAINT "Die_companyId_fkey";

-- DropForeignKey
ALTER TABLE "FinishingProcess" DROP CONSTRAINT "FinishingProcess_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "FinishingProcess" DROP CONSTRAINT "FinishingProcess_processId_fkey";

-- DropForeignKey
ALTER TABLE "IncomingQty" DROP CONSTRAINT "IncomingQty_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "IncomingQty" DROP CONSTRAINT "IncomingQty_outwardId_fkey";

-- DropForeignKey
ALTER TABLE "IncomingQty" DROP CONSTRAINT "IncomingQty_processRouteId_fkey";

-- DropForeignKey
ALTER TABLE "IncomingQty" DROP CONSTRAINT "IncomingQty_sendRoute_fkey";

-- DropForeignKey
ALTER TABLE "InwardProcessDtl" DROP CONSTRAINT "InwardProcessDtl_processId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_boardId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_branchId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_colorId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_createdById_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_customerId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_cuttingSizeId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_designerId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_dieId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_followUpId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_fullBoardId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_gsmId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_itemGroupId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_labelItemId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_labelSizeId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_orderEntryId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_otherBoardId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_plateId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_plateSupplierId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_refJobCardId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_storeId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_styleItemId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "JobCardSizeBreakup" DROP CONSTRAINT "JobCardSizeBreakup_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "LabelPrintingDetails" DROP CONSTRAINT "LabelPrintingDetails_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "LabelPrintingDetails" DROP CONSTRAINT "LabelPrintingDetails_processId_fkey";

-- DropForeignKey
ALTER TABLE "LaminationDetails" DROP CONSTRAINT "LaminationDetails_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "LaminationDetails" DROP CONSTRAINT "LaminationDetails_laminationId_fkey";

-- DropForeignKey
ALTER TABLE "MachineDetails" DROP CONSTRAINT "MachineDetails_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "MachineDetails" DROP CONSTRAINT "MachineDetails_macId_fkey";

-- DropForeignKey
ALTER TABLE "MachineDetails" DROP CONSTRAINT "MachineDetails_machineId_fkey";

-- DropForeignKey
ALTER TABLE "MobileNotification" DROP CONSTRAINT "MobileNotification_machineId_fkey";

-- DropForeignKey
ALTER TABLE "MobileNotification" DROP CONSTRAINT "MobileNotification_roleId_fkey";

-- DropForeignKey
ALTER TABLE "MobileNotification" DROP CONSTRAINT "MobileNotification_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderSizeBreakup" DROP CONSTRAINT "OrderSizeBreakup_orderStyleBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "OrderSizeBreakup" DROP CONSTRAINT "OrderSizeBreakup_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "OrderStyleBreakup" DROP CONSTRAINT "OrderStyleBreakup_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderStyleBreakup" DROP CONSTRAINT "OrderStyleBreakup_styleId_fkey";

-- DropForeignKey
ALTER TABLE "PISizeBreakup" DROP CONSTRAINT "PISizeBreakup_PIStyleBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "PISizeBreakup" DROP CONSTRAINT "PISizeBreakup_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "PIStyleBreakup" DROP CONSTRAINT "PIStyleBreakup_ProformaInvoiceItemId_fkey";

-- DropForeignKey
ALTER TABLE "PIStyleBreakup" DROP CONSTRAINT "PIStyleBreakup_styleId_fkey";

-- DropForeignKey
ALTER TABLE "Packing" DROP CONSTRAINT "Packing_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "PackingBreakup" DROP CONSTRAINT "PackingBreakup_PackingSizeBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "PackingBreakup" DROP CONSTRAINT "PackingBreakup_packingUomId_fkey";

-- DropForeignKey
ALTER TABLE "PackingSizeBreakup" DROP CONSTRAINT "PackingSizeBreakup_PackingStyleBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "PackingSizeBreakup" DROP CONSTRAINT "PackingSizeBreakup_orderSizeBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "PackingSizeBreakup" DROP CONSTRAINT "PackingSizeBreakup_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "PackingStyleBreakup" DROP CONSTRAINT "PackingStyleBreakup_PackingItemsId_fkey";

-- DropForeignKey
ALTER TABLE "PackingStyleBreakup" DROP CONSTRAINT "PackingStyleBreakup_styleId_fkey";

-- DropForeignKey
ALTER TABLE "Plate" DROP CONSTRAINT "Plate_companyId_fkey";

-- DropForeignKey
ALTER TABLE "PlateDetails" DROP CONSTRAINT "PlateDetails_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "PlateDetails" DROP CONSTRAINT "PlateDetails_machineId_fkey";

-- DropForeignKey
ALTER TABLE "PlateDetails" DROP CONSTRAINT "PlateDetails_plateId_fkey";

-- DropForeignKey
ALTER TABLE "PrintingDetails" DROP CONSTRAINT "PrintingDetails_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "PrintingDetails" DROP CONSTRAINT "PrintingDetails_processId_fkey";

-- DropForeignKey
ALTER TABLE "Process" DROP CONSTRAINT "Process_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Process" DROP CONSTRAINT "Process_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessBillDtl" DROP CONSTRAINT "ProcessBillDtl_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessDetails" DROP CONSTRAINT "ProcessDetails_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessDetails" DROP CONSTRAINT "ProcessDetails_processId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessGroup" DROP CONSTRAINT "ProcessGroup_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessGroupList" DROP CONSTRAINT "ProcessGroupList_processGroupId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessGroupList" DROP CONSTRAINT "ProcessGroupList_processId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessRoute" DROP CONSTRAINT "ProcessRoute_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessRoute" DROP CONSTRAINT "ProcessRoute_processId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionAllocation" DROP CONSTRAINT "ProductionAllocation_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionAllocationDtl" DROP CONSTRAINT "ProductionAllocationDtl_processId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionInward" DROP CONSTRAINT "ProductionInward_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionInwardDtl" DROP CONSTRAINT "ProductionInwardDtl_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionInwardDtl" DROP CONSTRAINT "ProductionInwardDtl_processId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionOutward" DROP CONSTRAINT "ProductionOutward_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionOutwardDtl" DROP CONSTRAINT "ProductionOutwardDtl_prevProcessId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionOutwardDtl" DROP CONSTRAINT "ProductionOutwardDtl_processId_fkey";

-- DropForeignKey
ALTER TABLE "ReworkBatchTracker" DROP CONSTRAINT "ReworkBatchTracker_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "ReworkBatchTracker" DROP CONSTRAINT "ReworkBatchTracker_processRouteId_fkey";

-- DropForeignKey
ALTER TABLE "ReworkBatchTracker" DROP CONSTRAINT "ReworkBatchTracker_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReworkLog" DROP CONSTRAINT "ReworkLog_Userid_fkey";

-- DropForeignKey
ALTER TABLE "ReworkLog" DROP CONSTRAINT "ReworkLog_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "ReworkLog" DROP CONSTRAINT "ReworkLog_processRouteId_fkey";

-- DropForeignKey
ALTER TABLE "SaleBillEntrySizeBreakup" DROP CONSTRAINT "SaleBillEntrySizeBreakup_SalesSizeBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "SaleBillEntrySizeBreakup" DROP CONSTRAINT "SaleBillEntrySizeBreakup_saleBillEntryStyleBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "SaleBillEntrySizeBreakup" DROP CONSTRAINT "SaleBillEntrySizeBreakup_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "SaleBillEntryStyleBreakup" DROP CONSTRAINT "SaleBillEntryStyleBreakup_salesBillEntryItemsId_fkey";

-- DropForeignKey
ALTER TABLE "SaleBillEntryStyleBreakup" DROP CONSTRAINT "SaleBillEntryStyleBreakup_styleId_fkey";

-- DropForeignKey
ALTER TABLE "SaleOrderSizeBreakup" DROP CONSTRAINT "SaleOrderSizeBreakup_saleStyleBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "SaleOrderSizeBreakup" DROP CONSTRAINT "SaleOrderSizeBreakup_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "SaleOrderStyleBreakup" DROP CONSTRAINT "SaleOrderStyleBreakup_salesItemId_fkey";

-- DropForeignKey
ALTER TABLE "SaleOrderStyleBreakup" DROP CONSTRAINT "SaleOrderStyleBreakup_styleId_fkey";

-- DropForeignKey
ALTER TABLE "SalesDeliveryPacking" DROP CONSTRAINT "SalesDeliveryPacking_salesSizeBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "SalesOrderPacking" DROP CONSTRAINT "SalesOrderPacking_saleOrderSizeBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturnSizeBreakup" DROP CONSTRAINT "SalesReturnSizeBreakup_salesReturnStyleBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturnSizeBreakup" DROP CONSTRAINT "SalesReturnSizeBreakup_salesSizeBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturnSizeBreakup" DROP CONSTRAINT "SalesReturnSizeBreakup_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturnStyleBreakup" DROP CONSTRAINT "SalesReturnStyleBreakup_salesReturnItemsId_fkey";

-- DropForeignKey
ALTER TABLE "SalesReturnStyleBreakup" DROP CONSTRAINT "SalesReturnStyleBreakup_styleId_fkey";

-- DropForeignKey
ALTER TABLE "SalesSizeBreakup" DROP CONSTRAINT "SalesSizeBreakup_salesOrderSizeBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "SalesSizeBreakup" DROP CONSTRAINT "SalesSizeBreakup_salesStyleBreakupId_fkey";

-- DropForeignKey
ALTER TABLE "SalesSizeBreakup" DROP CONSTRAINT "SalesSizeBreakup_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "SalesStyleBreakup" DROP CONSTRAINT "SalesStyleBreakup_salesDeliveryItemId_fkey";

-- DropForeignKey
ALTER TABLE "SalesStyleBreakup" DROP CONSTRAINT "SalesStyleBreakup_styleId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "Stock" DROP CONSTRAINT "Stock_styleId_fkey";

-- DropForeignKey
ALTER TABLE "Style" DROP CONSTRAINT "Style_gsmId_fkey";

-- DropForeignKey
ALTER TABLE "Style" DROP CONSTRAINT "Style_itemGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Style" DROP CONSTRAINT "Style_sizeTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "Style" DROP CONSTRAINT "Style_uomId_fkey";

-- DropForeignKey
ALTER TABLE "VarnishDetails" DROP CONSTRAINT "VarnishDetails_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "VarnishDetails" DROP CONSTRAINT "VarnishDetails_varnishId_fkey";

-- DropForeignKey
ALTER TABLE "productionempPunch" DROP CONSTRAINT "productionempPunch_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "takenmachines" DROP CONSTRAINT "takenmachines_jobCardId_fkey";

-- AlterTable
ALTER TABLE "JobCardSizeBreakup" ALTER COLUMN "jobCardId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductionAllocation" ALTER COLUMN "jobCardId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductionOutward" ALTER COLUMN "jobCardId" DROP NOT NULL;

-- DropTable
DROP TABLE "Board";

-- DropTable
DROP TABLE "BoardQuality";

-- DropTable
DROP TABLE "Die";

-- DropTable
DROP TABLE "FinishingProcess";

-- DropTable
DROP TABLE "IncomingQty";

-- DropTable
DROP TABLE "JobCard";

-- DropTable
DROP TABLE "LabelPrintingDetails";

-- DropTable
DROP TABLE "LaminationDetails";

-- DropTable
DROP TABLE "MachineDetails";

-- DropTable
DROP TABLE "MobileNotification";

-- DropTable
DROP TABLE "OrderSizeBreakup";

-- DropTable
DROP TABLE "OrderStyleBreakup";

-- DropTable
DROP TABLE "PISizeBreakup";

-- DropTable
DROP TABLE "PIStyleBreakup";

-- DropTable
DROP TABLE "PackingBreakup";

-- DropTable
DROP TABLE "PackingSizeBreakup";

-- DropTable
DROP TABLE "PackingStyleBreakup";

-- DropTable
DROP TABLE "Plate";

-- DropTable
DROP TABLE "PlateDetails";

-- DropTable
DROP TABLE "PrintingDetails";

-- DropTable
DROP TABLE "Process";

-- DropTable
DROP TABLE "ProcessDetails";

-- DropTable
DROP TABLE "ProcessGroup";

-- DropTable
DROP TABLE "ProcessGroupList";

-- DropTable
DROP TABLE "ReworkBatchTracker";

-- DropTable
DROP TABLE "ReworkLog";

-- DropTable
DROP TABLE "SaleBillEntrySizeBreakup";

-- DropTable
DROP TABLE "SaleBillEntryStyleBreakup";

-- DropTable
DROP TABLE "SaleOrderSizeBreakup";

-- DropTable
DROP TABLE "SaleOrderStyleBreakup";

-- DropTable
DROP TABLE "SalesDeliveryPacking";

-- DropTable
DROP TABLE "SalesOrderPacking";

-- DropTable
DROP TABLE "SalesReturnSizeBreakup";

-- DropTable
DROP TABLE "SalesReturnStyleBreakup";

-- DropTable
DROP TABLE "SalesSizeBreakup";

-- DropTable
DROP TABLE "SalesStyleBreakup";

-- DropTable
DROP TABLE "Style";

-- DropTable
DROP TABLE "VarnishDetails";

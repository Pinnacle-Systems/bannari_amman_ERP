/*
  Warnings:

  - You are about to drop the `JobCardSizeBreakup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Machine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProcessRoute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `productionempPunch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pushLogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `splitSizes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `takenmachines` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobCardSizeBreakup" DROP CONSTRAINT "JobCardSizeBreakup_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "Machine" DROP CONSTRAINT "Machine_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Machine" DROP CONSTRAINT "Machine_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "Machine" DROP CONSTRAINT "Machine_sizeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductionAllocationDtl" DROP CONSTRAINT "ProductionAllocationDtl_processRouteId_fkey";

-- DropForeignKey
ALTER TABLE "productionempPunch" DROP CONSTRAINT "productionempPunch_Machineid_fkey";

-- DropForeignKey
ALTER TABLE "productionempPunch" DROP CONSTRAINT "productionempPunch_Userid_fkey";

-- DropForeignKey
ALTER TABLE "productionempPunch" DROP CONSTRAINT "productionempPunch_departmentid_fkey";

-- DropForeignKey
ALTER TABLE "productionempPunch" DROP CONSTRAINT "productionempPunch_processRouteId_fkey";

-- DropForeignKey
ALTER TABLE "pushLogs" DROP CONSTRAINT "pushLogs_Userid_fkey";

-- DropForeignKey
ALTER TABLE "pushLogs" DROP CONSTRAINT "pushLogs_productionlog_fkey";

-- DropForeignKey
ALTER TABLE "splitSizes" DROP CONSTRAINT "splitSizes_jobCardSizeId_fkey";

-- DropForeignKey
ALTER TABLE "splitSizes" DROP CONSTRAINT "splitSizes_pushLogId_fkey";

-- DropForeignKey
ALTER TABLE "takenmachines" DROP CONSTRAINT "takenmachines_Machineid_fkey";

-- DropForeignKey
ALTER TABLE "takenmachines" DROP CONSTRAINT "takenmachines_Userid_fkey";

-- DropForeignKey
ALTER TABLE "takenmachines" DROP CONSTRAINT "takenmachines_departmentid_fkey";

-- DropForeignKey
ALTER TABLE "takenmachines" DROP CONSTRAINT "takenmachines_processRouteId_fkey";

-- DropTable
DROP TABLE "JobCardSizeBreakup";

-- DropTable
DROP TABLE "Machine";

-- DropTable
DROP TABLE "ProcessRoute";

-- DropTable
DROP TABLE "productionempPunch";

-- DropTable
DROP TABLE "pushLogs";

-- DropTable
DROP TABLE "splitSizes";

-- DropTable
DROP TABLE "takenmachines";

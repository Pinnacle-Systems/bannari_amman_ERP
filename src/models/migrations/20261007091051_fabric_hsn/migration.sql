/*
  Warnings:

  - Added the required column `hsnId` to the `FabricMaster` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "YarnMaster" DROP CONSTRAINT "YarnMaster_contentId_fkey";

-- DropForeignKey
ALTER TABLE "YarnMaster" DROP CONSTRAINT "YarnMaster_countsId_fkey";

-- AlterTable
ALTER TABLE "FabricMaster" ADD COLUMN     "hsnId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "YarnMaster" ALTER COLUMN "countsId" DROP NOT NULL,
ALTER COLUMN "contentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "YarnMasterDetail" ALTER COLUMN "percentage" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "YarnMaster" ADD CONSTRAINT "YarnMaster_countsId_fkey" FOREIGN KEY ("countsId") REFERENCES "CountsMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnMaster" ADD CONSTRAINT "YarnMaster_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricMaster" ADD CONSTRAINT "FabricMaster_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `YarnBlendDetails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "YarnBlendDetails" DROP CONSTRAINT "YarnBlendDetails_yarnBlendId_fkey";

-- DropForeignKey
ALTER TABLE "YarnBlendDetails" DROP CONSTRAINT "YarnBlendDetails_yarnMasterId_fkey";

-- DropTable
DROP TABLE "YarnBlendDetails";

-- CreateTable
CREATE TABLE "YarnMasterDetail" (
    "id" SERIAL NOT NULL,
    "yarnMasterId" INTEGER NOT NULL,
    "yarnBlendId" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "YarnMasterDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "YarnMasterDetail" ADD CONSTRAINT "YarnMasterDetail_yarnMasterId_fkey" FOREIGN KEY ("yarnMasterId") REFERENCES "YarnMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnMasterDetail" ADD CONSTRAINT "YarnMasterDetail_yarnBlendId_fkey" FOREIGN KEY ("yarnBlendId") REFERENCES "YarnBlendMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

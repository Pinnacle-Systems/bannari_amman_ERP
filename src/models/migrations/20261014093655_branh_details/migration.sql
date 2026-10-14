/*
  Warnings:

  - A unique constraint covering the columns `[gstNo]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[panNo]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[udyam]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[msmeNo]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "gstNo" TEXT,
ADD COLUMN     "msmeNo" TEXT,
ADD COLUMN     "panNo" TEXT,
ADD COLUMN     "telephone" TEXT,
ADD COLUMN     "udyam" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Branch_gstNo_key" ON "Branch"("gstNo");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_panNo_key" ON "Branch"("panNo");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_udyam_key" ON "Branch"("udyam");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_msmeNo_key" ON "Branch"("msmeNo");

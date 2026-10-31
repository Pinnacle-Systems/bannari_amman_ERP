-- AlterTable
ALTER TABLE "YarnProcessDetails" ADD COLUMN     "colorId" INTEGER;

-- AddForeignKey
ALTER TABLE "YarnProcessDetails" ADD CONSTRAINT "YarnProcessDetails_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE SET NULL ON UPDATE CASCADE;

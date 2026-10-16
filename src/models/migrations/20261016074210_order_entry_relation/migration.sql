-- AlterTable
ALTER TABLE "OrderEntry" ADD COLUMN     "companyId" INTEGER,
ADD COLUMN     "finYearId" INTEGER;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_finYearId_fkey" FOREIGN KEY ("finYearId") REFERENCES "FinYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

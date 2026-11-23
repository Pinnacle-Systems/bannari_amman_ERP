-- AlterTable
ALTER TABLE "Bank" ADD COLUMN     "bankBranchid" INTEGER;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_bankBranchid_fkey" FOREIGN KEY ("bankBranchid") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

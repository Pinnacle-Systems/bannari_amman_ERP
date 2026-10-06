-- CreateTable
CREATE TABLE "ContentMaster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "ContentMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentMaster_name_key" ON "ContentMaster"("name");

-- AddForeignKey
ALTER TABLE "ContentMaster" ADD CONSTRAINT "ContentMaster_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

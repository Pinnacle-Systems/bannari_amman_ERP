-- CreateTable
CREATE TABLE "CountsMaster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "CountsMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CountsMaster_name_key" ON "CountsMaster"("name");

-- AddForeignKey
ALTER TABLE "CountsMaster" ADD CONSTRAINT "CountsMaster_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

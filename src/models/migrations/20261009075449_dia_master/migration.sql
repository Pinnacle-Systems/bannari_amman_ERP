-- CreateTable
CREATE TABLE "DiaMaster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,
    "kDia" BOOLEAN NOT NULL DEFAULT false,
    "fDia" BOOLEAN NOT NULL DEFAULT false,
    "measurement" TEXT,

    CONSTRAINT "DiaMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiaMaster_name_kDia_fDia_key" ON "DiaMaster"("name", "kDia", "fDia");

-- AddForeignKey
ALTER TABLE "DiaMaster" ADD CONSTRAINT "DiaMaster_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

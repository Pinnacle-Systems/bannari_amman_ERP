-- CreateTable
CREATE TABLE "YarnBlendMaster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "YarnBlendMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YarnBlendMaster_name_key" ON "YarnBlendMaster"("name");

-- AddForeignKey
ALTER TABLE "YarnBlendMaster" ADD CONSTRAINT "YarnBlendMaster_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

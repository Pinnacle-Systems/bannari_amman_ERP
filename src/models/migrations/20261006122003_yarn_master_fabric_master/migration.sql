-- CreateTable
CREATE TABLE "YarnMaster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,
    "countsId" INTEGER NOT NULL,
    "contentId" INTEGER NOT NULL,
    "hsnId" INTEGER NOT NULL,

    CONSTRAINT "YarnMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YarnBlendDetails" (
    "id" SERIAL NOT NULL,
    "yarnMasterId" INTEGER NOT NULL,
    "yarnBlendId" INTEGER NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "YarnBlendDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FabricMaster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "FabricMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "YarnMaster_name_key" ON "YarnMaster"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FabricMaster_name_key" ON "FabricMaster"("name");

-- AddForeignKey
ALTER TABLE "YarnMaster" ADD CONSTRAINT "YarnMaster_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnMaster" ADD CONSTRAINT "YarnMaster_countsId_fkey" FOREIGN KEY ("countsId") REFERENCES "CountsMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnMaster" ADD CONSTRAINT "YarnMaster_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnMaster" ADD CONSTRAINT "YarnMaster_hsnId_fkey" FOREIGN KEY ("hsnId") REFERENCES "Hsn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnBlendDetails" ADD CONSTRAINT "YarnBlendDetails_yarnMasterId_fkey" FOREIGN KEY ("yarnMasterId") REFERENCES "YarnMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YarnBlendDetails" ADD CONSTRAINT "YarnBlendDetails_yarnBlendId_fkey" FOREIGN KEY ("yarnBlendId") REFERENCES "YarnBlendMaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FabricMaster" ADD CONSTRAINT "FabricMaster_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

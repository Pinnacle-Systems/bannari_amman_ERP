-- CreateTable
CREATE TABLE "Gauge" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Gauge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoopLength" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "LoopLength_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DesignMaster" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "DesignMaster_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Gauge_name_key" ON "Gauge"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LoopLength_name_key" ON "LoopLength"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DesignMaster_name_key" ON "DesignMaster"("name");

-- AddForeignKey
ALTER TABLE "Gauge" ADD CONSTRAINT "Gauge_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoopLength" ADD CONSTRAINT "LoopLength_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignMaster" ADD CONSTRAINT "DesignMaster_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

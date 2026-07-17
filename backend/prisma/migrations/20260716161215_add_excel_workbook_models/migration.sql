-- CreateEnum
CREATE TYPE "WorkbookStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Workbook" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "status" "WorkbookStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalSheets" INTEGER NOT NULL DEFAULT 0,
    "processedSheets" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worksheet" (
    "id" SERIAL NOT NULL,
    "workbookId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sheetIndex" INTEGER NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "totalColumns" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worksheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorksheetColumn" (
    "id" SERIAL NOT NULL,
    "worksheetId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "columnIndex" INTEGER NOT NULL,
    "dataType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorksheetColumn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorksheetRow" (
    "id" SERIAL NOT NULL,
    "worksheetId" INTEGER NOT NULL,
    "rowNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorksheetRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorksheetCell" (
    "id" SERIAL NOT NULL,
    "rowId" INTEGER NOT NULL,
    "columnId" INTEGER NOT NULL,
    "value" TEXT,
    "valueType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorksheetCell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workbook_fileId_key" ON "Workbook"("fileId");

-- CreateIndex
CREATE INDEX "Workbook_status_idx" ON "Workbook"("status");

-- CreateIndex
CREATE INDEX "Worksheet_workbookId_idx" ON "Worksheet"("workbookId");

-- CreateIndex
CREATE UNIQUE INDEX "Worksheet_workbookId_sheetIndex_key" ON "Worksheet"("workbookId", "sheetIndex");

-- CreateIndex
CREATE INDEX "WorksheetColumn_worksheetId_idx" ON "WorksheetColumn"("worksheetId");

-- CreateIndex
CREATE UNIQUE INDEX "WorksheetColumn_worksheetId_columnIndex_key" ON "WorksheetColumn"("worksheetId", "columnIndex");

-- CreateIndex
CREATE INDEX "WorksheetRow_worksheetId_idx" ON "WorksheetRow"("worksheetId");

-- CreateIndex
CREATE UNIQUE INDEX "WorksheetRow_worksheetId_rowNumber_key" ON "WorksheetRow"("worksheetId", "rowNumber");

-- CreateIndex
CREATE INDEX "WorksheetCell_rowId_idx" ON "WorksheetCell"("rowId");

-- CreateIndex
CREATE INDEX "WorksheetCell_columnId_idx" ON "WorksheetCell"("columnId");

-- CreateIndex
CREATE INDEX "WorksheetCell_rowId_columnId_idx" ON "WorksheetCell"("rowId", "columnId");

-- CreateIndex
CREATE UNIQUE INDEX "WorksheetCell_rowId_columnId_key" ON "WorksheetCell"("rowId", "columnId");

-- AddForeignKey
ALTER TABLE "Workbook" ADD CONSTRAINT "Workbook_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worksheet" ADD CONSTRAINT "Worksheet_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "Workbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetColumn" ADD CONSTRAINT "WorksheetColumn_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "Worksheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetRow" ADD CONSTRAINT "WorksheetRow_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "Worksheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetCell" ADD CONSTRAINT "WorksheetCell_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "WorksheetRow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorksheetCell" ADD CONSTRAINT "WorksheetCell_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "WorksheetColumn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

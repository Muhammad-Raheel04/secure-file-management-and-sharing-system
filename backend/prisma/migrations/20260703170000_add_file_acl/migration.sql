-- CreateEnum
CREATE TYPE "FileAccess" AS ENUM ('READ', 'WRITE');

-- RenameColumn
ALTER TABLE "File" RENAME COLUMN "employeeId" TO "ownerId";

-- RenameConstraint
ALTER TABLE "File" RENAME CONSTRAINT "File_employeeId_fkey" TO "File_ownerId_fkey";

-- AlterTable
ALTER TABLE "File"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropDefault
ALTER TABLE "File"
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "FilePermission" (
    "id" SERIAL NOT NULL,
    "fileId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "grantedById" INTEGER NOT NULL,
    "access" "FileAccess" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FilePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "File_ownerId_idx" ON "File"("ownerId");

-- CreateIndex
CREATE INDEX "File_uploadedById_idx" ON "File"("uploadedById");

-- CreateIndex
CREATE UNIQUE INDEX "FilePermission_fileId_userId_key" ON "FilePermission"("fileId", "userId");

-- CreateIndex
CREATE INDEX "FilePermission_fileId_idx" ON "FilePermission"("fileId");

-- CreateIndex
CREATE INDEX "FilePermission_userId_idx" ON "FilePermission"("userId");

-- CreateIndex
CREATE INDEX "FilePermission_grantedById_idx" ON "FilePermission"("grantedById");

-- AddForeignKey
ALTER TABLE "FilePermission" ADD CONSTRAINT "FilePermission_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePermission" ADD CONSTRAINT "FilePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilePermission" ADD CONSTRAINT "FilePermission_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

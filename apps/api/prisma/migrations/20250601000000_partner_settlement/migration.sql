-- CreateEnum
CREATE TYPE "PilotCorridor" AS ENUM ('PH', 'US');

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'submitted_to_partner';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN "pilotCorridor" "PilotCorridor";

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "partnerSettlementId" TEXT,
ADD COLUMN "submittedToPartnerAt" TIMESTAMP(3),
ADD COLUMN "settlementMode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_partnerSettlementId_key" ON "Transaction"("partnerSettlementId");

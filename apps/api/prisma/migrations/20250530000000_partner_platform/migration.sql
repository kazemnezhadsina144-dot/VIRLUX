-- Partner hierarchy + transaction fee split for MSB program
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "fintracMsbNumber" TEXT,
    "revShareBps" INTEGER NOT NULL DEFAULT 35,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Organization" ADD COLUMN "partnerId" TEXT;

CREATE INDEX "Organization_partnerId_idx" ON "Organization"("partnerId");

ALTER TABLE "Organization" ADD CONSTRAINT "Organization_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD COLUMN "platformFeeCad" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Transaction" ADD COLUMN "partnerFeeCad" DECIMAL(65,30) NOT NULL DEFAULT 0;

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_DATABASE !== "true") {
    console.log("Skipping seed in production (set SEED_DATABASE=true to override)");
    return;
  }

  const org = await prisma.organization.upsert({
    where: { id: "seed-org-demo" },
    update: {},
    create: {
      id: "seed-org-demo",
      name: "Virlux Demo Co",
      legalName: "Virlux Demo Co Ltd.",
      fintracMsb: false,
    },
  });

  const passwordHash = await bcrypt.hash("demo12345", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@virlux.com" },
    update: { kycStatus: "approved", organizationId: org.id },
    create: {
      email: "demo@virlux.com",
      passwordHash,
      fullName: "Demo User",
      kycStatus: "approved",
      role: "owner",
      organizationId: org.id,
      wallet: {
        create: {
          cadBalance: 10000,
          usdcBalance: 2500,
          address: `0x${crypto.randomBytes(20).toString("hex")}`,
        },
      },
    },
  });

  await prisma.kycSubmission.upsert({
    where: { id: "seed-kyc-demo" },
    update: {},
    create: {
      id: "seed-kyc-demo",
      userId: user.id,
      documentType: "passport",
      documentNumber: "DEMO-000000",
      status: "approved",
      reviewedAt: new Date(),
    },
  });

  console.log("Seeded demo account (dev only): demo@virlux.com");
}

main().finally(() => prisma.$disconnect());

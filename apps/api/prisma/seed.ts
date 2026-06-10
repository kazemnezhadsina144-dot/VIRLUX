import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { resolveDemoSeedPassword } from "@virlux/shared";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_DATABASE !== "true") {
    console.log("Skipping seed in production (set SEED_DATABASE=true to override)");
    return;
  }

  const demoPassword = resolveDemoSeedPassword();

  const org = await prisma.organization.upsert({
    where: { id: "seed-org-demo" },
    update: { pilotCorridor: "PH", pilotVolumeCapCad: 50000 },
    create: {
      id: "seed-org-demo",
      name: "Virlux Demo Co",
      legalName: "Virlux Demo Co Ltd.",
      fintracMsb: false,
      pilotCorridor: "PH",
      pilotVolumeCapCad: 50000,
    },
  });

  const partner = await prisma.partner.upsert({
    where: { id: "seed-partner-demo" },
    update: { webhookSecret: "demo-webhook-secret-16" },
    create: {
      id: "seed-partner-demo",
      legalName: "Demo Settlement Partner Ltd.",
      fintracMsbNumber: "M00000000",
      revShareBps: 35,
      contactEmail: "partner@example.com",
      webhookSecret: "demo-webhook-secret-16",
    },
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: { partnerId: partner.id },
  });

  const passwordHash = await bcrypt.hash(demoPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@virlux.com" },
    update: { kycStatus: "approved", organizationId: org.id, passwordHash },
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

  await prisma.user.upsert({
    where: { email: "approver@virlux.demo" },
    update: { kycStatus: "approved", organizationId: org.id, role: "approver", passwordHash },
    create: {
      email: "approver@virlux.demo",
      passwordHash,
      fullName: "Demo Approver",
      kycStatus: "approved",
      role: "approver",
      organizationId: org.id,
    },
  });

  console.log("Seeded demo accounts: demo@virlux.com, approver@virlux.demo (password from DEMO_SEED_PASSWORD)");
}

main().finally(() => prisma.$disconnect());

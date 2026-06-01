import { prisma } from "../lib/prisma";
import { config } from "../lib/config";
import { AppError } from "../lib/errors";
import { toCadEquivalent } from "./rates";

const COUNTRY_TO_CORRIDOR: Record<string, "PH" | "US"> = {
  PH: "PH",
  PHL: "PH",
  PHILIPPINES: "PH",
  US: "US",
  USA: "US",
  "UNITED STATES": "US",
};

function normalizeCorridor(country?: string | null): "PH" | "US" | null {
  if (!country?.trim()) return null;
  const key = country.trim().toUpperCase();
  return COUNTRY_TO_CORRIDOR[key] ?? null;
}

export async function assertPilotCorridor(userId: string, recipientCountry?: string | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: { select: { pilotCorridor: true } } },
  });
  const locked = user?.organization?.pilotCorridor;
  if (!locked) return;

  const corridor = normalizeCorridor(recipientCountry);
  if (!corridor) {
    throw new AppError(
      400,
      `Pilot corridor locked to ${locked}. Set recipient country to ${locked === "PH" ? "Philippines" : "United States"}.`,
      "CORRIDOR_LOCKED"
    );
  }
  if (corridor !== locked) {
    throw new AppError(
      400,
      `Organization pilot corridor is ${locked}; ${corridor} is not enabled`,
      "CORRIDOR_LOCKED"
    );
  }
}

export async function assertPartnerAttestedFunding(userId: string) {
  if (!config.requirePartnerDeposit) return;

  const completed = await prisma.paymentIntent.count({
    where: { userId, status: "completed" },
  });
  if (completed === 0) {
    throw new AppError(
      403,
      "A partner-confirmed deposit is required before sending payments",
      "DEPOSIT_REQUIRED"
    );
  }
}

export async function assertPilotVolumeCap(userId: string, additionalCad: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: { select: { id: true, pilotVolumeCapCad: true } } },
  });
  const cap = user?.organization?.pilotVolumeCapCad;
  if (!cap || Number(cap) <= 0 || !user?.organizationId) return;

  const orgUsers = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true },
  });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const txs = await prisma.transaction.findMany({
    where: {
      userId: { in: orgUsers.map((u) => u.id) },
      createdAt: { gte: since },
      status: { notIn: ["cancelled", "failed"] },
    },
    select: { amountIn: true, fromCurrency: true },
  });

  let total = 0;
  for (const tx of txs) {
    total += await toCadEquivalent(Number(tx.amountIn), tx.fromCurrency as "CAD" | "USD");
  }

  const capNum = Number(cap);
  if (total + additionalCad > capNum) {
    throw new AppError(
      400,
      `Pilot volume cap of $${capNum.toLocaleString()} CAD per 30 days would be exceeded`,
      "PILOT_VOLUME_EXCEEDED"
    );
  }
}

export async function getOrgVolumeUsageCad(orgId: string): Promise<{ used: number; cap: number | null }> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { pilotVolumeCapCad: true },
  });
  const cap = org?.pilotVolumeCapCad ? Number(org.pilotVolumeCapCad) : null;

  const orgUsers = await prisma.user.findMany({
    where: { organizationId: orgId },
    select: { id: true },
  });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const txs = await prisma.transaction.findMany({
    where: {
      userId: { in: orgUsers.map((u) => u.id) },
      createdAt: { gte: since },
      status: { notIn: ["cancelled", "failed"] },
    },
    select: { amountIn: true, fromCurrency: true },
  });

  let used = 0;
  for (const tx of txs) {
    used += await toCadEquivalent(Number(tx.amountIn), tx.fromCurrency as "CAD" | "USD");
  }

  return { used, cap };
}

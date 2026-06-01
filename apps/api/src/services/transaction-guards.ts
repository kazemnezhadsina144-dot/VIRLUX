import { prisma } from "../lib/prisma";
import { config } from "../lib/config";
import { AppError } from "../lib/errors";

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

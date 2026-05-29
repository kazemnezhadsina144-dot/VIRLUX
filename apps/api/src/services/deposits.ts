import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { credit } from "./ledger";
import { config } from "../lib/config";
import { logger } from "../lib/logger";
import { notifyDepositCompleted } from "../telegram/handlers";

const DEPOSIT_ROLES = new Set(["owner", "admin", "approver"]);

function interacReference(): string {
  return `VRLX-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

export async function createInteracDeposit(userId: string, amountCad: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.kycStatus !== "approved") {
    throw new AppError(403, "Complete KYC before depositing", "KYC_REQUIRED");
  }
  if (!DEPOSIT_ROLES.has(user.role)) {
    throw new AppError(403, "Your role cannot initiate deposits", "FORBIDDEN");
  }
  if (amountCad <= 0) throw new AppError(400, "Amount must be positive");

  const intent = await prisma.paymentIntent.create({
    data: {
      userId,
      amountCad,
      reference: interacReference(),
      status: "pending",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId,
      action: "deposit.interac.initiated",
      metadata: { paymentIntentId: intent.id, amountCad, reference: intent.reference },
    },
  });

  if (config.autoSettle) {
    scheduleDepositCompletion(intent.id);
  }

  return intent;
}

export function scheduleDepositCompletion(intentId: string) {
  setTimeout(async () => {
    try {
      await completeDeposit(intentId);
    } catch (e) {
      logger.error("Deposit completion failed", { intentId, err: String(e) });
    }
  }, 2000);
}

export async function completeDeposit(intentId: string) {
  const intent = await prisma.paymentIntent.findUnique({ where: { id: intentId } });
  if (!intent || intent.status !== "pending") return intent;

  const claimed = await prisma.paymentIntent.updateMany({
    where: { id: intentId, status: "pending" },
    data: { status: "processing" },
  });
  if (claimed.count === 0) return intent;

  await credit(
    intent.userId,
    "CAD",
    Number(intent.amountCad),
    "deposit",
    intent.id,
    `Interac ${intent.reference}`
  );

  const completed = await prisma.paymentIntent.update({
    where: { id: intentId },
    data: { status: "completed", completedAt: new Date() },
  });

  notifyDepositCompleted(completed).catch((e) => logger.error("Telegram notify failed", { err: String(e) }));
  return completed;
}

export async function listDeposits(userId: string) {
  return prisma.paymentIntent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

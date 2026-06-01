import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { credit } from "./ledger";
import { config } from "../lib/config";
import { assertSameOrg, orgMemberIds } from "../lib/org";
import { logger } from "../lib/logger";
import { notifyDepositCompleted } from "../telegram/handlers";
import { emitPartnerWebhook } from "./partner-webhooks";

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

  emitPartnerWebhook(intent.userId, "deposit.completed", {
    paymentIntentId: completed.id,
    reference: completed.reference,
    amountCad: Number(completed.amountCad),
  }).catch(() => {});

  return completed;
}

export async function listDeposits(userId: string) {
  return prisma.paymentIntent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function listOrgPendingDeposits(reviewerId: string) {
  const memberIds = await orgMemberIds(reviewerId);
  if (!memberIds) return [];

  const intents = await prisma.paymentIntent.findMany({
    where: { userId: { in: memberIds }, status: "pending" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, email: true, fullName: true } } },
  });

  return intents.map((i) => ({
    id: i.id,
    userId: i.userId,
    userEmail: i.user.email,
    userName: i.user.fullName,
    amountCad: i.amountCad,
    reference: i.reference,
    status: i.status,
    createdAt: i.createdAt,
  }));
}

export async function confirmDepositAsAdmin(intentId: string, adminId: string) {
  if (!config.allowOrgDepositConfirm) {
    throw new AppError(
      403,
      "Org deposit confirmation disabled — use platform admin or partner webhook",
      "FORBIDDEN"
    );
  }
  const intent = await prisma.paymentIntent.findUnique({
    where: { id: intentId },
    include: { user: { select: { id: true } } },
  });
  if (!intent) throw new AppError(404, "Deposit not found");
  if (intent.status !== "pending") {
    throw new AppError(409, "Deposit is not pending", "INVALID_STATUS");
  }
  await assertSameOrg(adminId, intent.userId);

  const completed = await completeDeposit(intentId);

  await prisma.auditLog.create({
    data: {
      userId: adminId,
      action: "deposit.interac.confirmed",
      metadata: { paymentIntentId: intentId, targetUserId: intent.userId, reference: intent.reference },
    },
  });

  return completed;
}

import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { config } from "../lib/config";
import { AppError } from "../lib/errors";
import { debit, credit } from "./ledger";
import { toCadEquivalent } from "./rates";
import { logger } from "../lib/logger";
import { notifyTransactionCreated } from "../telegram/handlers";
import { isCircleEnabled, transferUsdc } from "../integrations/circle/client";

const SEND_ROLES = new Set(["owner", "admin", "approver"]);

export async function createTransaction(input: {
  userId: string;
  quoteId: string;
  recipientCountry?: string;
  recipientName?: string;
  recipientWallet?: string;
  memo?: string;
  idempotencyKey?: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user || user.kycStatus !== "approved") {
    throw new AppError(403, "KYC must be approved before sending", "KYC_REQUIRED");
  }
  if (!SEND_ROLES.has(user.role)) {
    throw new AppError(403, "Your role cannot initiate payments", "FORBIDDEN");
  }

  const tx = await prisma.$transaction(async (db) => {
    if (input.idempotencyKey) {
      const existing = await db.transaction.findFirst({
        where: { userId: input.userId, idempotencyKey: input.idempotencyKey },
      });
      if (existing) return existing;
    }

    const quote = await db.quote.findUnique({ where: { id: input.quoteId } });
    if (!quote) throw new AppError(404, "Quote not found", "QUOTE_NOT_FOUND");
    if (quote.consumedAt) throw new AppError(410, "Quote already used", "QUOTE_CONSUMED");
    if (quote.expiresAt < new Date()) throw new AppError(410, "Quote expired", "QUOTE_EXPIRED");
    if (quote.userId && quote.userId !== input.userId) {
      throw new AppError(403, "Quote belongs to another user", "QUOTE_FORBIDDEN");
    }

    const consumed = await db.quote.updateMany({
      where: { id: input.quoteId, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });
    if (consumed.count === 0) {
      throw new AppError(410, "Quote unavailable", "QUOTE_CONSUMED");
    }

    const amountIn = Number(quote.amountIn);
    const fromCurrency = quote.fromCurrency as "CAD" | "USD";
    const amountInCad = await toCadEquivalent(amountIn, fromCurrency);
    const needsApproval = amountInCad >= config.approvalThresholdCad;

    await debit(
      input.userId,
      fromCurrency,
      amountIn,
      "transaction_hold",
      input.quoteId,
      `Payment hold for quote ${input.quoteId}`,
      db
    );

    const created = await db.transaction.create({
      data: {
        userId: input.userId,
        quoteId: quote.id,
        idempotencyKey: input.idempotencyKey,
        amountIn: quote.amountIn,
        fromCurrency: quote.fromCurrency,
        toStablecoin: quote.toStablecoin,
        network: quote.network,
        midMarketRate: quote.midMarketRate,
        feeAmount: quote.feeAmount,
        gasEstimateUsd: quote.gasEstimateUsd,
        amountOut: quote.amountOut,
        recipientCountry: input.recipientCountry,
        recipientName: input.recipientName,
        recipientWallet: input.recipientWallet,
        memo: input.memo,
        status: needsApproval ? "awaiting_approval" : "processing",
        needsApproval,
      },
    });

    await db.auditLog.create({
      data: {
        userId: input.userId,
        action: "transaction.created",
        metadata: { transactionId: created.id, amountIn, fromCurrency, amountInCad },
      },
    });

    return created;
  });

  if (!tx.needsApproval && config.autoSettle) {
    scheduleSettlement(tx.id);
  }

  notifyTransactionCreated(tx).catch((e) => logger.error("Telegram notify failed", { err: String(e) }));

  return tx;
}

async function sameOrganization(userIdA: string, userIdB: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    prisma.user.findUnique({ where: { id: userIdA }, select: { organizationId: true } }),
    prisma.user.findUnique({ where: { id: userIdB }, select: { organizationId: true } }),
  ]);
  if (!a?.organizationId || !b?.organizationId) return false;
  return a.organizationId === b.organizationId;
}

export async function approveTransaction(txId: string, approverId: string) {
  const approver = await prisma.user.findUnique({ where: { id: approverId } });
  if (!approver || !["owner", "admin", "approver"].includes(approver.role)) {
    throw new AppError(403, "Insufficient permissions", "FORBIDDEN");
  }

  const tx = await prisma.transaction.findFirst({
    where: { id: txId, status: "awaiting_approval" },
  });
  if (!tx) throw new AppError(404, "Transaction not found or not awaiting approval");

  if (tx.userId === approverId) {
    throw new AppError(403, "Cannot approve your own payment (maker-checker)", "SELF_APPROVAL");
  }

  if (!(await sameOrganization(approverId, tx.userId))) {
    throw new AppError(403, "Transaction is outside your organization", "FORBIDDEN");
  }

  const updated = await prisma.transaction.updateMany({
    where: { id: txId, status: "awaiting_approval" },
    data: {
      status: "processing",
      approvedBy: approverId,
      approvedAt: new Date(),
    },
  });
  if (updated.count === 0) {
    throw new AppError(409, "Transaction already processed", "CONFLICT");
  }

  const result = await prisma.transaction.findUniqueOrThrow({ where: { id: txId } });

  await prisma.auditLog.create({
    data: {
      userId: approverId,
      action: "transaction.approved",
      metadata: { transactionId: tx.id },
    },
  });

  if (config.autoSettle) scheduleSettlement(tx.id);
  return result;
}

export function scheduleSettlement(txId: string) {
  setTimeout(async () => {
    try {
      await settleTransaction(txId);
    } catch (e) {
      logger.error("Settlement failed", { txId, err: String(e) });
    }
  }, 2500);
}

export async function settleTransaction(txId: string) {
  const tx = await prisma.transaction.findUnique({ where: { id: txId } });
  if (!tx || tx.status !== "processing") return tx;

  const amountOut = Number(tx.amountOut);
  const isExternalRemittance = Boolean(tx.recipientWallet?.trim());
  let txHash: string | undefined;
  let circleTransferId: string | undefined;

  if (isExternalRemittance) {
    if (isCircleEnabled()) {
      try {
        const chainMap = { ethereum: "ETH", polygon: "MATIC", solana: "SOL" } as const;
        const circle = await transferUsdc({
          amount: amountOut.toFixed(2),
          destinationAddress: tx.recipientWallet!,
          idempotencyKey: `virlux-${tx.id}`,
          network: chainMap[tx.network],
        });
        circleTransferId = circle.id;
        txHash = circle.transactionHash;
        logger.info("Circle transfer initiated", { txId, circleTransferId });
      } catch (e) {
        logger.error("Circle transfer failed", { txId, err: String(e) });
        return failTransaction(txId, "Circle settlement failed");
      }
    } else if (config.autoSettle) {
      txHash = `0x${crypto.randomBytes(32).toString("hex")}`;
    } else {
      return failTransaction(txId, "Circle not configured for external settlement");
    }
  } else {
    await credit(tx.userId, "USDC", amountOut, "transaction", tx.id, `USDC purchase ${tx.id}`);
    if (config.autoSettle) {
      txHash = `0x${crypto.randomBytes(32).toString("hex")}`;
    }
  }

  const settled = await prisma.transaction.updateMany({
    where: { id: txId, status: "processing" },
    data: {
      status: "confirmed",
      txHash: txHash ?? null,
      circleTransferId: circleTransferId ?? null,
      settledAt: new Date(),
    },
  });
  if (settled.count === 0) return tx;

  const updated = await prisma.transaction.findUniqueOrThrow({ where: { id: txId } });

  await prisma.auditLog.create({
    data: {
      userId: tx.userId,
      action: "transaction.settled",
      metadata: { transactionId: tx.id, txHash, circleTransferId, external: isExternalRemittance },
    },
  });

  return updated;
}

export async function failTransaction(txId: string, reason: string) {
  const tx = await prisma.transaction.findUnique({ where: { id: txId } });
  if (!tx) throw new AppError(404, "Transaction not found");

  if (!["pending", "processing", "awaiting_approval"].includes(tx.status)) {
    throw new AppError(409, "Transaction cannot be failed in current status", "INVALID_STATUS");
  }

  const fromCurrency = tx.fromCurrency as "CAD" | "USD";
  await credit(tx.userId, fromCurrency, Number(tx.amountIn), "transaction_refund", tx.id, `Refund ${tx.id}`);

  const failed = await prisma.transaction.updateMany({
    where: {
      id: txId,
      status: { in: ["pending", "processing", "awaiting_approval"] },
    },
    data: { status: "failed", failureReason: reason },
  });
  if (failed.count === 0) {
    throw new AppError(409, "Transaction already finalized", "CONFLICT");
  }

  return prisma.transaction.findUniqueOrThrow({ where: { id: txId } });
}

export async function listTransactionsForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.organizationId) {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  const orgUserIds = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true },
  });

  return prisma.transaction.findMany({
    where: { userId: { in: orgUserIds.map((u) => u.id) } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

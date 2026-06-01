import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { config } from "../../lib/config";
import { logger } from "../../lib/logger";
import { AppError } from "../../lib/errors";
import { emitPartnerWebhook } from "../partner-webhooks";
import { failTransaction } from "../transaction-failure";
import type { PartnerSettlementPayload } from "./types";

export async function applyPartnerSettlement(payload: PartnerSettlementPayload) {
  const tx = await prisma.transaction.findUnique({
    where: { id: payload.virluxTransactionId },
    include: {
      user: {
        include: { organization: { include: { partner: true } } },
      },
    },
  });

  if (!tx) throw new AppError(404, "Transaction not found", "NOT_FOUND");

  const orgPartnerId = tx.user.organization?.partnerId;
  if (orgPartnerId && orgPartnerId !== payload.partnerId) {
    throw new AppError(403, "Partner mismatch for organization", "FORBIDDEN");
  }

  if (payload.partnerSettlementId) {
    const existing = await prisma.transaction.findUnique({
      where: { partnerSettlementId: payload.partnerSettlementId },
    });
    if (existing && existing.id !== tx.id) {
      throw new AppError(409, "Duplicate partner settlement ID", "DUPLICATE_SETTLEMENT");
    }
    if (existing?.id === tx.id && existing.status === "confirmed") {
      return existing;
    }
  }

  if (tx.status === "confirmed") return tx;

  if (tx.status !== "submitted_to_partner" && tx.status !== "processing") {
    throw new AppError(409, "Transaction not awaiting partner settlement", "INVALID_STATUS");
  }

  if (payload.status === "failed") {
    return failTransaction(tx.id, payload.failureReason ?? "Partner settlement failed");
  }

  const updated = await prisma.transaction.updateMany({
    where: {
      id: tx.id,
      status: { in: ["submitted_to_partner", "processing"] },
    },
    data: {
      status: "confirmed",
      partnerSettlementId: payload.partnerSettlementId,
      txHash: payload.txHash ?? null,
      settledAt: new Date(),
      platformFeeCad: payload.platformFeeCad ?? tx.platformFeeCad,
      partnerFeeCad: payload.partnerFeeCad ?? tx.partnerFeeCad,
      settlementMode: config.settlementMode,
    },
  });

  if (updated.count === 0) {
    const current = await prisma.transaction.findUnique({ where: { id: tx.id } });
    if (current?.status === "confirmed") return current;
    throw new AppError(409, "Transaction already finalized", "CONFLICT");
  }

  const confirmed = await prisma.transaction.findUniqueOrThrow({ where: { id: tx.id } });

  await prisma.auditLog.create({
    data: {
      userId: tx.userId,
      action: "transaction.settled.partner",
      metadata: {
        transactionId: tx.id,
        partnerSettlementId: payload.partnerSettlementId,
        partnerId: payload.partnerId,
        txHash: payload.txHash,
        orchestration: true,
      },
    },
  });

  emitPartnerWebhook(tx.userId, "transaction.confirmed", {
    transactionId: tx.id,
    partnerSettlementId: payload.partnerSettlementId,
    platformFeeCad: Number(confirmed.platformFeeCad),
    partnerFeeCad: Number(confirmed.partnerFeeCad),
    status: "confirmed",
  }).catch(() => {});

  logger.info("Partner settlement applied", {
    txId: tx.id,
    partnerSettlementId: payload.partnerSettlementId,
  });

  return confirmed;
}

export async function markSubmittedToPartner(txId: string, actorId: string, reason?: string) {
  const tx = await prisma.transaction.findUnique({ where: { id: txId } });
  if (!tx) throw new AppError(404, "Transaction not found", "NOT_FOUND");
  if (tx.status !== "processing") {
    throw new AppError(409, "Transaction must be in processing status", "INVALID_STATUS");
  }

  const updated = await prisma.transaction.updateMany({
    where: { id: txId, status: "processing" },
    data: {
      status: "submitted_to_partner",
      submittedToPartnerAt: new Date(),
      settlementMode: config.settlementMode,
    },
  });
  if (updated.count === 0) {
    throw new AppError(409, "Transaction already submitted", "CONFLICT");
  }

  await prisma.auditLog.create({
    data: {
      userId: actorId,
      action: "transaction.submitted_to_partner.manual",
      metadata: { transactionId: txId, reason },
    },
  });

  return prisma.transaction.findUniqueOrThrow({ where: { id: txId } });
}

export function buildInstructionIdempotencyKey(txId: string): string {
  return `virlux-${txId}`;
}

export function fakeSandboxTxHash(): string {
  return `0x${crypto.randomBytes(32).toString("hex")}`;
}

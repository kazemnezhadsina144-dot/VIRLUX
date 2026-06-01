import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { credit } from "./ledger";
import { emitPartnerWebhook } from "./partner-webhooks";

export async function failTransaction(txId: string, reason: string) {
  const tx = await prisma.transaction.findUnique({ where: { id: txId } });
  if (!tx) throw new AppError(404, "Transaction not found");

  if (!["pending", "processing", "awaiting_approval", "submitted_to_partner"].includes(tx.status)) {
    throw new AppError(409, "Transaction cannot be failed in current status", "INVALID_STATUS");
  }

  const fromCurrency = tx.fromCurrency as "CAD" | "USD";
  await credit(tx.userId, fromCurrency, Number(tx.amountIn), "transaction_refund", tx.id, `Refund ${tx.id}`);

  const failed = await prisma.transaction.updateMany({
    where: {
      id: txId,
      status: { in: ["pending", "processing", "awaiting_approval", "submitted_to_partner"] },
    },
    data: { status: "failed", failureReason: reason },
  });
  if (failed.count === 0) {
    throw new AppError(409, "Transaction already finalized", "CONFLICT");
  }

  const failedTx = await prisma.transaction.findUniqueOrThrow({ where: { id: txId } });
  emitPartnerWebhook(failedTx.userId, "transaction.failed", {
    transactionId: txId,
    reason,
    status: "failed",
  }).catch(() => {});

  return failedTx;
}

import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { config } from "../../lib/config";
import { logger } from "../../lib/logger";
import { credit } from "../ledger";
import { toCadEquivalent } from "../rates";
import { isCircleEnabled, pollTransferComplete, transferUsdc } from "../../integrations/circle/client";
import { emitPartnerWebhook } from "../partner-webhooks";
import { PARTNER_PRICING } from "@virlux/shared";
import { failTransaction } from "../transaction-failure";
import { buildInstructionIdempotencyKey, fakeSandboxTxHash } from "./partner-result";
import type { SettlementExecutor } from "./types";

/** Dev/staging only — simulates partner rail via Circle sandbox or fake hash */
export const sandboxSettlementExecutor: SettlementExecutor = {
  async submitInstruction(txId: string) {
    await sandboxSettleTransaction(txId);
  },
};

export async function sandboxSettleTransaction(txId: string) {
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
          idempotencyKey: buildInstructionIdempotencyKey(tx.id),
          network: chainMap[tx.network],
        });
        circleTransferId = circle.id;
        const final =
          circle.status === "complete" ? circle : await pollTransferComplete(circle.id);
        if (final.status === "failed" || final.status === "cancelled") {
          logger.error("Circle transfer failed on chain", { txId, status: final.status });
          return failTransaction(txId, `Circle transfer ${final.status}`);
        }
        txHash = final.transactionHash;
        circleTransferId = final.id;
      } catch (e) {
        logger.error("Circle transfer failed", { txId, err: String(e) });
        return failTransaction(txId, "Circle settlement failed");
      }
    } else if (config.autoSettle) {
      txHash = fakeSandboxTxHash();
    } else {
      return failTransaction(txId, "Circle not configured for external settlement");
    }
  } else if (config.autoSettle) {
    await credit(tx.userId, "USDC", amountOut, "transaction", tx.id, `USDC purchase ${tx.id}`);
    txHash = fakeSandboxTxHash();
  } else {
    return failTransaction(txId, "Internal settlement requires AUTO_SETTLE in sandbox mode");
  }

  const amountInCad = await toCadEquivalent(Number(tx.amountIn), tx.fromCurrency as "CAD" | "USD");
  const user = await prisma.user.findUnique({
    where: { id: tx.userId },
    include: { organization: { include: { partner: true } } },
  });
  const revShareBps = user?.organization?.partner?.revShareBps ?? PARTNER_PRICING.partnerDefaultRevShareBps;
  const partnerFeeCad = Math.round(((amountInCad * revShareBps) / 10000) * 100) / 100;
  const platformFeeCad = Math.round(((amountInCad * PARTNER_PRICING.platformDefaultBps) / 10000) * 100) / 100;

  const settled = await prisma.transaction.updateMany({
    where: { id: txId, status: "processing" },
    data: {
      status: "confirmed",
      txHash: txHash ?? null,
      circleTransferId: circleTransferId ?? null,
      settledAt: new Date(),
      platformFeeCad,
      partnerFeeCad,
      settlementMode: config.settlementMode,
      partnerSettlementId: `sandbox-${txId}`,
    },
  });
  if (settled.count === 0) return tx;

  const updated = await prisma.transaction.findUniqueOrThrow({ where: { id: txId } });

  await prisma.auditLog.create({
    data: {
      userId: tx.userId,
      action: "transaction.settled.sandbox",
      metadata: { transactionId: tx.id, txHash, circleTransferId, sandbox: true },
    },
  });

  emitPartnerWebhook(tx.userId, "transaction.confirmed", {
    transactionId: tx.id,
    amountInCad,
    platformFeeCad,
    partnerFeeCad,
    status: "confirmed",
  }).catch(() => {});

  return updated;
}

export function scheduleSandboxSettlement(txId: string) {
  setTimeout(async () => {
    try {
      await sandboxSettleTransaction(txId);
    } catch (e) {
      logger.error("Sandbox settlement failed", { txId, err: String(e) });
    }
  }, 2500);
}

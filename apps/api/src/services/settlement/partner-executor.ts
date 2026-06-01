import { prisma } from "../../lib/prisma";
import { config } from "../../lib/config";
import { logger } from "../../lib/logger";
import { emitPartnerWebhook } from "../partner-webhooks";
import { buildInstructionIdempotencyKey } from "./partner-result";
import type { InstructionPayload, SettlementExecutor } from "./types";

export const partnerSettlementExecutor: SettlementExecutor = {
  async submitInstruction(txId: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id: txId },
      include: {
        user: {
          include: { organization: { include: { partner: true } } },
        },
      },
    });
    if (!tx || tx.status !== "processing") return;

    const updated = await prisma.transaction.updateMany({
      where: { id: txId, status: "processing" },
      data: {
        status: "submitted_to_partner",
        submittedToPartnerAt: new Date(),
        settlementMode: config.settlementMode,
      },
    });
    if (updated.count === 0) return;

    const instruction: InstructionPayload = {
      virluxTransactionId: tx.id,
      organizationId: tx.user.organizationId,
      partnerId: tx.user.organization?.partnerId ?? null,
      amountIn: tx.amountIn.toString(),
      fromCurrency: tx.fromCurrency,
      amountOut: tx.amountOut.toString(),
      toStablecoin: tx.toStablecoin,
      network: tx.network,
      recipientWallet: tx.recipientWallet,
      recipientCountry: tx.recipientCountry,
      recipientName: tx.recipientName,
      feeAmount: tx.feeAmount.toString(),
      idempotencyKey: buildInstructionIdempotencyKey(tx.id),
    };

    await prisma.auditLog.create({
      data: {
        userId: tx.userId,
        action: "transaction.instruction.sent",
        metadata: { transactionId: tx.id, partnerId: instruction.partnerId, orchestration: true },
      },
    });

    await emitPartnerWebhook(tx.userId, "transaction.instruction", instruction as unknown as Record<string, unknown>);

    logger.info("Settlement instruction sent to partner", { txId, partnerId: instruction.partnerId });
  },
};

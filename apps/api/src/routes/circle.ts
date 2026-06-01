import { Router, raw } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";
import { config } from "../lib/config";

const router = Router();

/** Circle transfer notifications — sandbox simulation only */
router.post(
  "/webhook",
  raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    if (config.settlementMode !== "sandbox" && config.settlementMode !== "direct") {
      return res.status(403).json({ error: "Circle webhooks disabled outside direct/sandbox settlement mode" });
    }
    const secret = req.headers["x-circle-signature"] ?? req.headers["x-webhook-signature"];
    if (config.isProd && config.circleWebhookSecret && secret !== config.circleWebhookSecret) {
      return res.status(403).json({ error: "Invalid webhook signature" });
    }

    const body = JSON.parse(req.body.toString()) as {
      data?: {
        id?: string;
        status?: string;
        transactionHash?: string;
      };
    };

    const transferId = body.data?.id;
    const status = body.data?.status;
    if (!transferId) {
      return res.json({ ok: true, ignored: true });
    }

    const tx = await prisma.transaction.findFirst({
      where: { circleTransferId: transferId },
    });

    if (!tx) {
      logger.warn("Circle webhook: unknown transfer", { transferId });
      return res.json({ ok: true });
    }

    if (status === "failed" || status === "cancelled") {
      logger.error("Circle webhook: transfer failed", { transferId, txId: tx.id, status });
      // Status already handled by poll path; log for ops reconciliation
    } else if (status === "complete" && (tx.status === "processing" || tx.status === "submitted_to_partner")) {
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          status: "confirmed",
          txHash: body.data?.transactionHash ?? tx.txHash,
          settledAt: new Date(),
        },
      });
      logger.info("Circle webhook: transfer confirmed", { transferId, txId: tx.id });
    }

    res.json({ ok: true });
  })
);

export default router;

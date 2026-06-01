import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { verifyPartnerSettlementSignature } from "../services/partner-webhooks";
import { applyPartnerSettlement } from "../services/settlement";

const router = Router();

const settlementWebhookSchema = z.object({
  partnerId: z.string().min(1),
  virluxTransactionId: z.string().min(1),
  status: z.enum(["complete", "failed"]),
  partnerSettlementId: z.string().min(1),
  txHash: z.string().optional(),
  platformFeeCad: z.coerce.number().nonnegative().optional(),
  partnerFeeCad: z.coerce.number().nonnegative().optional(),
  failureReason: z.string().optional(),
});

router.post(
  "/settlement/webhook",
  asyncHandler(async (req, res) => {
    const signature = req.headers["x-virlux-signature"] as string | undefined;
    const raw = JSON.stringify(req.body);
    const parsed = settlementWebhookSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const valid = await verifyPartnerSettlementSignature(parsed.data.partnerId, raw, signature);
    if (!valid) {
      return res.status(403).json({ error: "Invalid webhook signature", code: "FORBIDDEN" });
    }

    const tx = await applyPartnerSettlement(parsed.data);
    res.json({ ok: true, transaction: tx });
  })
);

export default router;

import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth, requireRole, attachFreshUser } from "../middleware/auth";
import { getWallet, listLedger } from "../services/ledger";
import * as depositService from "../services/deposits";

const router = Router();

router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const wallet = await getWallet(req.auth!.userId);
    res.json(wallet);
  })
);

router.get(
  "/ledger",
  requireAuth,
  asyncHandler(async (req, res) => {
    const entries = await listLedger(req.auth!.userId);
    res.json(entries);
  })
);

const depositSchema = z.object({
  amountCad: z.coerce.number().positive().max(1_000_000),
});

router.post(
  "/deposit/interac",
  requireAuth,
  attachFreshUser,
  requireRole("owner", "admin", "approver"),
  asyncHandler(async (req, res) => {
    const parsed = depositSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const intent = await depositService.createInteracDeposit(req.auth!.userId, parsed.data.amountCad);
    res.status(201).json({
      paymentIntent: intent,
      instructions: {
        method: "Interac e-Transfer",
        reference: intent.reference,
        amountCad: intent.amountCad,
        message: "Use the reference above as the Interac message. Funds credit when payment confirms.",
      },
    });
  })
);

router.get(
  "/deposits",
  requireAuth,
  asyncHandler(async (req, res) => {
    const deposits = await depositService.listDeposits(req.auth!.userId);
    res.json(deposits);
  })
);

export default router;

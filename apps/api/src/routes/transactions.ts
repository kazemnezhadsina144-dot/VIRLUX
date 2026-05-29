import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth, requireRole, attachFreshUser } from "../middleware/auth";
import * as txService from "../services/transactions";

const router = Router();

const walletAddress = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid EVM wallet address")
  .optional();

const createSchema = z.object({
  quoteId: z.string().min(1),
  recipientCountry: z.string().length(2).optional(),
  recipientName: z.string().max(200).optional(),
  recipientWallet: walletAddress,
  memo: z.string().max(500).optional(),
  idempotencyKey: z.string().min(8).max(64),
});

router.get(
  "/",
  requireAuth,
  attachFreshUser,
  asyncHandler(async (req, res) => {
    const txs = await txService.listTransactionsForUser(req.auth!.userId);
    res.json(txs);
  })
);

router.get(
  "/:id",
  requireAuth,
  attachFreshUser,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    const tx = await prisma.transaction.findFirst({
      where: { id: String(req.params.id) },
    });
    if (!tx) return res.status(404).json({ error: "Transaction not found" });

    const sameOrg =
      user?.organizationId &&
      (await prisma.user.findFirst({
        where: { id: tx.userId, organizationId: user.organizationId },
      }));

    if (tx.userId !== req.auth!.userId && !sameOrg) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(tx);
  })
);

router.post(
  "/",
  requireAuth,
  attachFreshUser,
  requireRole("owner", "admin", "approver"),
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const tx = await txService.createTransaction({
      userId: req.auth!.userId,
      ...parsed.data,
    });
    res.status(201).json(tx);
  })
);

router.post(
  "/:id/approve",
  requireAuth,
  attachFreshUser,
  requireRole("owner", "admin", "approver"),
  asyncHandler(async (req, res) => {
    const updated = await txService.approveTransaction(String(req.params.id), req.auth!.userId);
    res.json(updated);
  })
);

export default router;

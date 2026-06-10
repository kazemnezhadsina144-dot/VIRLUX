import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { createQuote } from "../services/quotes";
import { buildQuote } from "../services/rates";

const router = Router();

const quoteSchema = z.object({
  amount: z.coerce.number().positive().max(10_000_000),
  fromCurrency: z.enum(["CAD", "USD"]),
  toStablecoin: z.enum(["USDC", "USDT"]),
  network: z.enum(["ethereum", "polygon", "solana"]),
});

/** Public indicative estimate — not persisted, cannot be used for send */
router.post(
  "/estimate",
  asyncHandler(async (req, res) => {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const quote = await buildQuote(parsed.data);
    res.json({ ...quote, indicative: true });
  })
);

/** Persisted quote bound to authenticated user — required for send */
router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const quote = await createQuote({ ...parsed.data, userId: req.auth!.userId });
    res.json(quote);
  })
);

router.get("/health", (_req, res) => {
  res.json({ ok: true, rateProviders: ["frankfurter", "coingecko"] });
});

export default router;

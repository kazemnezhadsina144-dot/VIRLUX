import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { fundDemoWallet, isDemoFundEnabled } from "../services/demo-fund";

const router = Router();

router.post(
  "/fund",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!isDemoFundEnabled()) {
      return res.status(403).json({ error: "Demo funding disabled", code: "DEMO_FUND_DISABLED" });
    }
    const wallet = await fundDemoWallet(req.auth!.userId);
    res.json({ ok: true, cadBalance: wallet?.cadBalance });
  })
);

export default router;

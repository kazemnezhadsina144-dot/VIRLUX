import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { createTelegramLinkToken } from "../services/account";

const router = Router();

router.post(
  "/telegram-link",
  requireAuth,
  asyncHandler(async (req, res) => {
    const link = await createTelegramLinkToken(req.auth!.userId);
    res.json(link);
  })
);

export default router;

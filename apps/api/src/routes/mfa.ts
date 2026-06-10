import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { generateTotpSecret, totpKeyUri, verifyTotp } from "../lib/mfa";
import { isPlatformAdminEmail } from "../lib/platform";

const router = Router();

const activateSchema = z.object({
  code: z.string().regex(/^\d{6}$/),
  secret: z.string().min(16),
});

router.get(
  "/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId },
      select: { totpSecret: true, email: true },
    });
    res.json({
      enrolled: Boolean(user.totpSecret),
      recommended: isPlatformAdminEmail(user.email),
    });
  })
);

router.post(
  "/setup",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId } });
    if (user.totpSecret) {
      throw new AppError(409, "Two-factor authentication is already enabled", "MFA_ALREADY_ENABLED");
    }
    const secret = generateTotpSecret();
    res.json({
      secret,
      uri: totpKeyUri(user.email, secret),
    });
  })
);

router.post(
  "/activate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = activateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid activation payload" });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId } });
    if (user.totpSecret) {
      throw new AppError(409, "Two-factor authentication is already enabled", "MFA_ALREADY_ENABLED");
    }
    if (!verifyTotp(parsed.data.secret, parsed.data.code)) {
      throw new AppError(400, "Invalid verification code", "INVALID_MFA");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: parsed.data.secret },
    });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "auth.mfa.enabled", metadata: {} },
    });
    res.json({ ok: true });
  })
);

export default router;

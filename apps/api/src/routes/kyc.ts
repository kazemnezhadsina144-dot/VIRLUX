import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import * as kycService from "../services/kyc";

const router = Router();

router.get(
  "/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = await kycService.getKycStatus(req.auth!.userId);
    res.json(status);
  })
);

const submitSchema = z.object({
  documentType: z.enum(["passport", "drivers_license", "national_id"]),
  documentNumber: z.string().min(3).max(64),
  country: z.string().length(2).optional(),
});

router.post(
  "/submit",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const submission = await kycService.submitKyc(req.auth!.userId, parsed.data);
    res.status(201).json({
      submission,
      message: "KYC submitted for review. Typical turnaround under 2 business days.",
    });
  })
);

export default router;

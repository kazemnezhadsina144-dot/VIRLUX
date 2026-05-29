import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth, requireRole, attachFreshUser } from "../middleware/auth";
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

router.get(
  "/review/queue",
  requireAuth,
  attachFreshUser,
  requireRole("owner", "admin"),
  asyncHandler(async (req, res) => {
    const queue = await kycService.listOrgKycQueue(req.auth!.userId);
    res.json(queue);
  })
);

router.post(
  "/review/:id/approve",
  requireAuth,
  attachFreshUser,
  requireRole("owner", "admin"),
  asyncHandler(async (req, res) => {
    const notes = (req.body as { notes?: string }).notes;
    const updated = await kycService.approveKycAsReviewer(String(req.params.id), req.auth!.userId, notes);
    res.json(updated);
  })
);

const rejectSchema = z.object({
  notes: z.string().min(3).max(500),
});

router.post(
  "/review/:id/reject",
  requireAuth,
  attachFreshUser,
  requireRole("owner", "admin"),
  asyncHandler(async (req, res) => {
    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const updated = await kycService.rejectKycAsReviewer(
      String(req.params.id),
      req.auth!.userId,
      parsed.data.notes
    );
    res.json(updated);
  })
);

export default router;

import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth, attachFreshUser } from "../middleware/auth";
import { requirePlatformAdmin } from "../middleware/platformAdmin";
import * as platformService from "../services/platform";

const router = Router();

router.use(requireAuth, attachFreshUser, requirePlatformAdmin);

router.get(
  "/kyc/queue",
  asyncHandler(async (_req, res) => {
    const queue = await platformService.listPlatformKycQueue();
    res.json(queue);
  })
);

router.post(
  "/kyc/review/:id/approve",
  asyncHandler(async (req, res) => {
    const notes = (req.body as { notes?: string }).notes;
    const updated = await platformService.approveKycAsPlatform(String(req.params.id), req.auth!.userId, notes);
    res.json(updated);
  })
);

const rejectSchema = z.object({ notes: z.string().min(3).max(500) });

router.post(
  "/kyc/review/:id/reject",
  asyncHandler(async (req, res) => {
    const parsed = rejectSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const updated = await platformService.rejectKycAsPlatform(
      String(req.params.id),
      req.auth!.userId,
      parsed.data.notes
    );
    res.json(updated);
  })
);

router.get(
  "/deposits/pending",
  asyncHandler(async (_req, res) => {
    const pending = await platformService.listPlatformPendingDeposits();
    res.json(pending);
  })
);

router.post(
  "/deposits/:id/confirm",
  asyncHandler(async (req, res) => {
    const intent = await platformService.confirmDepositAsPlatform(String(req.params.id), req.auth!.userId);
    res.json(intent);
  })
);

router.get(
  "/partners",
  asyncHandler(async (_req, res) => {
    const partners = await platformService.listPartners();
    res.json(partners);
  })
);

const createPartnerSchema = z.object({
  legalName: z.string().min(2).max(200),
  fintracMsbNumber: z.string().max(50).optional(),
  revShareBps: z.coerce.number().int().min(0).max(500).optional(),
  webhookUrl: z.union([z.string().url(), z.literal("")]).optional(),
  webhookSecret: z.string().min(16).max(128).optional(),
  contactEmail: z.string().email().optional(),
});

router.post(
  "/partners",
  asyncHandler(async (req, res) => {
    const parsed = createPartnerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const body = parsed.data;
    const partner = await platformService.createPartner(
      {
        legalName: body.legalName,
        fintracMsbNumber: body.fintracMsbNumber,
        revShareBps: body.revShareBps,
        webhookUrl: body.webhookUrl || undefined,
        webhookSecret: body.webhookSecret,
        contactEmail: body.contactEmail,
      },
      req.auth!.userId
    );
    res.status(201).json(partner);
  })
);

const assignPartnerSchema = z.object({
  partnerId: z.string().cuid().nullable(),
});

router.patch(
  "/organizations/:id/partner",
  asyncHandler(async (req, res) => {
    const parsed = assignPartnerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const org = await platformService.assignOrganizationPartner(
      String(req.params.id),
      parsed.data.partnerId,
      req.auth!.userId
    );
    res.json(org);
  })
);

router.get(
  "/partners/:id/orgs",
  asyncHandler(async (req, res) => {
    const orgs = await platformService.getPartnerOrganizations(String(req.params.id));
    res.json(orgs);
  })
);

router.get(
  "/exports/fintrac",
  asyncHandler(async (req, res) => {
    const fromStr = String(req.query.from ?? "");
    const toStr = String(req.query.to ?? "");
    const partnerId = req.query.partnerId ? String(req.query.partnerId) : undefined;

    const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const to = toStr ? new Date(toStr) : new Date();
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return res.status(400).json({ error: "Invalid from/to date" });
    }

    const csv = await platformService.exportFintracCsv(from, to, partnerId, req.auth!.userId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="virlux-fintrac-${from.toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  })
);

router.get(
  "/transactions/submitted",
  asyncHandler(async (_req, res) => {
    const txs = await platformService.listPlatformSubmittedTransactions();
    res.json(txs);
  })
);

const markSettledSchema = z.object({
  partnerSettlementId: z.string().min(1),
  txHash: z.string().optional(),
  platformFeeCad: z.coerce.number().nonnegative().optional(),
  partnerFeeCad: z.coerce.number().nonnegative().optional(),
  reason: z.string().optional(),
});

router.post(
  "/transactions/:id/mark-submitted",
  asyncHandler(async (req, res) => {
    const reason = (req.body as { reason?: string }).reason;
    const tx = await platformService.markTransactionSubmittedPlatform(
      String(req.params.id),
      req.auth!.userId,
      reason
    );
    res.json(tx);
  })
);

router.post(
  "/transactions/:id/mark-settled",
  asyncHandler(async (req, res) => {
    const parsed = markSettledSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const tx = await platformService.markTransactionSettledPlatform(
      String(req.params.id),
      req.auth!.userId,
      parsed.data
    );
    res.json(tx);
  })
);

const pilotCorridorSchema = z.object({
  pilotCorridor: z.enum(["PH", "US"]).nullable(),
});

router.patch(
  "/organizations/:id/pilot-corridor",
  asyncHandler(async (req, res) => {
    const parsed = pilotCorridorSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const org = await platformService.setOrganizationPilotCorridor(
      String(req.params.id),
      parsed.data.pilotCorridor,
      req.auth!.userId
    );
    res.json(org);
  })
);

export default router;

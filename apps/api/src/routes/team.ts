import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth, requireRole } from "../middleware/auth";
import * as teamService from "../services/team";

const router = Router();

async function orgId(userId: string) {
  const u = await prisma.user.findUnique({ where: { id: userId } });
  if (!u?.organizationId) throw new Error("No organization");
  return u.organizationId;
}

router.get(
  "/members",
  requireAuth,
  asyncHandler(async (req, res) => {
    const oid = await orgId(req.auth!.userId);
    const members = await teamService.listTeamMembers(oid);
    res.json(members);
  })
);

router.get(
  "/invites",
  requireAuth,
  requireRole("owner", "admin"),
  asyncHandler(async (req, res) => {
    const oid = await orgId(req.auth!.userId);
    const invites = await teamService.listPendingInvites(oid);
    res.json(invites);
  })
);

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "approver", "viewer"]),
});

router.post(
  "/invite",
  requireAuth,
  requireRole("owner", "admin"),
  asyncHandler(async (req, res) => {
    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const oid = await orgId(req.auth!.userId);
    const result = await teamService.createInvite({
      organizationId: oid,
      email: parsed.data.email,
      role: parsed.data.role,
      invitedById: req.auth!.userId,
    });
    res.status(201).json(result);
  })
);

router.post(
  "/accept",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { token } = req.body as { token?: string };
    if (!token) return res.status(400).json({ error: "token required" });
    const user = await teamService.acceptInvite(token, req.auth!.userId);
    res.json(user);
  })
);

router.patch(
  "/members/:id/role",
  requireAuth,
  requireRole("owner", "admin"),
  asyncHandler(async (req, res) => {
    const { role } = req.body as { role?: string };
    if (!["admin", "approver", "viewer"].includes(role ?? "")) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const oid = await orgId(req.auth!.userId);
    const updated = await teamService.updateMemberRole(
      oid,
      String(req.params.id),
      role as "admin" | "approver" | "viewer",
      req.auth!.userId
    );
    res.json(updated);
  })
);

export default router;

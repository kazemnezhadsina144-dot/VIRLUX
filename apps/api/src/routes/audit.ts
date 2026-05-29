import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth, requireRole, attachFreshUser } from "../middleware/auth";
import { prisma } from "../lib/prisma";

const router = Router();

router.get(
  "/",
  requireAuth,
  attachFreshUser,
  requireRole("owner", "admin"),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth!.userId } });
    if (!user?.organizationId) {
      const logs = await prisma.auditLog.findMany({
        where: { userId: req.auth!.userId },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return res.json(logs);
    }

    const orgUserIds = await prisma.user.findMany({
      where: { organizationId: user.organizationId },
      select: { id: true },
    });

    const logs = await prisma.auditLog.findMany({
      where: { userId: { in: orgUserIds.map((u) => u.id) } },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json(logs);
  })
);

export default router;

import { prisma } from "./prisma";
import { AppError } from "./errors";

export async function orgMemberIds(userId: string): Promise<string[] | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });
  if (!user?.organizationId) return null;
  const members = await prisma.user.findMany({
    where: { organizationId: user.organizationId },
    select: { id: true },
  });
  return members.map((m) => m.id);
}

export async function assertSameOrg(actorId: string, targetUserId: string) {
  const [actor, target] = await Promise.all([
    prisma.user.findUnique({ where: { id: actorId }, select: { organizationId: true } }),
    prisma.user.findUnique({ where: { id: targetUserId }, select: { organizationId: true } }),
  ]);
  if (!actor?.organizationId || actor.organizationId !== target?.organizationId) {
    throw new AppError(403, "Outside your organization", "FORBIDDEN");
  }
}

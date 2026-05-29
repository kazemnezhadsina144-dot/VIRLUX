import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { config } from "../lib/config";

export async function listTeamMembers(orgId: string) {
  return prisma.user.findMany({
    where: { organizationId: orgId },
    select: { id: true, email: true, fullName: true, role: true, kycStatus: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createInvite(input: {
  organizationId: string;
  email: string;
  role: "admin" | "approver" | "viewer";
  invitedById: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing?.organizationId === input.organizationId) {
    throw new AppError(409, "User already in organization", "ALREADY_MEMBER");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invite = await prisma.teamInvite.create({
    data: {
      organizationId: input.organizationId,
      email: input.email.toLowerCase(),
      role: input.role,
      token,
      expiresAt,
      invitedById: input.invitedById,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: input.invitedById,
      action: "team.invite.created",
      metadata: { email: input.email, role: input.role },
    },
  });

  return {
    invite,
    acceptUrl: `${config.appPublicUrl}/?invite=${token}`,
  };
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await prisma.teamInvite.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
    throw new AppError(400, "Invalid or expired invite", "INVALID_INVITE");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.email.toLowerCase() !== invite.email) {
    throw new AppError(403, "Invite email does not match your account", "EMAIL_MISMATCH");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { organizationId: invite.organizationId, role: invite.role },
  });

  await prisma.teamInvite.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: { organization: true },
  });
}

export async function updateMemberRole(
  orgId: string,
  memberId: string,
  role: "admin" | "approver" | "viewer",
  actorId: string
) {
  const member = await prisma.user.findFirst({
    where: { id: memberId, organizationId: orgId },
  });
  if (!member) throw new AppError(404, "Member not found");
  if (member.role === "owner") throw new AppError(403, "Cannot change owner role");

  return prisma.user.update({
    where: { id: memberId },
    data: { role },
  });
}

export async function listPendingInvites(orgId: string) {
  const invites = await prisma.teamInvite.findMany({
    where: { organizationId: orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  return invites.map(({ token: _token, ...rest }) => rest);
}

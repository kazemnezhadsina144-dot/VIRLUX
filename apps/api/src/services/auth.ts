import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { config } from "../lib/config";
import { AppError } from "../lib/errors";
import { isPlatformAdminEmail } from "../lib/platform";
import { getOrgVolumeUsageCad } from "./transaction-guards";
import { verifyTotp } from "../lib/mfa";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, email, role, type: "access" }, config.jwtSecret, {
    expiresIn: config.jwtAccessTtl as jwt.SignOptions["expiresIn"],
  });
}

export async function createRefreshToken(userId: string) {
  const raw = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + config.jwtRefreshTtlDays);
  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(raw), expiresAt },
  });
  return raw;
}

export async function rotateRefreshToken(raw: string) {
  const hash = hashToken(raw);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });
  if (!record) {
    throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH");
  }
  if (record.revokedAt) {
    await revokeAllRefreshTokens(record.userId);
    throw new AppError(401, "Refresh token reuse detected — all sessions revoked", "TOKEN_REUSE");
  }
  if (record.expiresAt < new Date()) {
    throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH");
  }
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: record.userId } });
  const accessToken = signAccessToken(user.id, user.email, user.role);
  const refreshToken = await createRefreshToken(user.id);
  return { accessToken, refreshToken, user: sanitizeUser(user) };
}

export async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function logoutUser(userId: string) {
  await revokeAllRefreshTokens(userId);
}

export async function registerUser(input: {
  email: string;
  password: string;
  fullName: string;
  companyName?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, "Email already registered", "EMAIL_EXISTS");

  const org = await prisma.organization.create({
    data: {
      name: input.companyName ?? `${input.fullName}'s Business`,
      legalName: input.companyName,
    },
  });

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: "owner",
      organizationId: org.id,
      wallet: { create: {} },
    },
    include: { wallet: true, organization: true },
  });

  await prisma.auditLog.create({
    data: { userId: user.id, action: "user.registered", metadata: { email: user.email } },
  });

  const accessToken = signAccessToken(user.id, user.email, user.role);
  const refreshToken = await createRefreshToken(user.id);
  return { accessToken, refreshToken, user: sanitizeUser(user) };
}

export async function loginUser(email: string, password: string, totpCode?: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { wallet: true, organization: true },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  if (isPlatformAdminEmail(user.email) && config.platformAdminMfaRequired && !user.totpSecret) {
    throw new AppError(
      403,
      "Platform admin must enroll two-factor authentication",
      "MFA_ENROLL_REQUIRED"
    );
  }

  if (user.totpSecret) {
    if (!totpCode) {
      throw new AppError(401, "Two-factor code required", "MFA_REQUIRED");
    }
    if (!(await verifyTotp(user.totpSecret, totpCode))) {
      throw new AppError(401, "Invalid two-factor code", "INVALID_MFA");
    }
  }

  const accessToken = signAccessToken(user.id, user.email, user.role);
  const refreshToken = await createRefreshToken(user.id);
  return { accessToken, refreshToken, user: sanitizeUser(user) };
}

export function sanitizeUser(user: {
  id: string;
  email: string;
  fullName: string;
  role: string;
  kycStatus: string;
  phone?: string | null;
  organization?: {
    id: string;
    name: string;
    pilotCorridor?: "PH" | "US" | null;
    pilotVolumeCapCad?: unknown;
  } | null;
}) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    kycStatus: user.kycStatus,
    phone: user.phone,
    organization: user.organization
      ? {
          id: user.organization.id,
          name: user.organization.name,
          pilotCorridor: user.organization.pilotCorridor ?? null,
          pilotVolumeCapCad:
            user.organization.pilotVolumeCapCad != null
              ? Number(user.organization.pilotVolumeCapCad)
              : null,
        }
      : null,
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true, organization: true },
  });
  if (!user) throw new AppError(404, "User not found");

  let pilotVolume: { usedCad: number; capCad: number | null } | null = null;
  if (user.organizationId) {
    const usage = await getOrgVolumeUsageCad(user.organizationId);
    pilotVolume = { usedCad: usage.used, capCad: usage.cap };
  }

  return {
    ...sanitizeUser(user),
    wallet: user.wallet,
    isPlatformAdmin: isPlatformAdminEmail(user.email),
    pilotVolume,
  };
}

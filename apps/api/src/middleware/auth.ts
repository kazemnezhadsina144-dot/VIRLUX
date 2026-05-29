import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { config } from "../lib/config";
import { ACCESS_COOKIE, parseCookies } from "../lib/cookies";

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
  kycStatus?: string;
  type?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const cookies = parseCookies(req);
  let token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) token = cookies[ACCESS_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized", code: "UNAUTHORIZED" });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    if (!payload.type || payload.type !== "access") {
      return res.status(401).json({ error: "Invalid token type", code: "INVALID_TOKEN" });
    }
    req.auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token", code: "INVALID_TOKEN" });
  }
}

/** Reload role/org from DB — JWT role alone is not authoritative for money movement */
export async function attachFreshUser(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.userId) return next();
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth.userId },
      select: { role: true, kycStatus: true, organizationId: true, email: true },
    });
    if (!user) {
      return res.status(401).json({ error: "User not found", code: "UNAUTHORIZED" });
    }
    req.auth.role = user.role;
    req.auth.kycStatus = user.kycStatus;
    req.auth.organizationId = user.organizationId ?? undefined;
    req.auth.email = user.email;
    next();
  } catch {
    return res.status(500).json({ error: "Auth check failed" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Insufficient permissions", code: "FORBIDDEN" });
    }
    next();
  };
}

export function clientIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim();
  return req.socket.remoteAddress ?? undefined;
}

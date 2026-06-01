import type { Request, Response, NextFunction } from "express";
import { isPlatformAdminEmail } from "../lib/platform";

export function requirePlatformAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.auth?.email || !isPlatformAdminEmail(req.auth.email)) {
    return res.status(403).json({ error: "Platform admin required", code: "FORBIDDEN" });
  }
  next();
}

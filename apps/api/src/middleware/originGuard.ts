import type { Request, Response, NextFunction } from "express";
import { config } from "../lib/config";

const WEBHOOK_PREFIXES = ["/api/partner", "/api/circle", "/api/telegram"];

/** Block cross-site browser writes that bypass CORS preflight expectations (PIPEDA / CSRF hygiene). */
export function originGuard(req: Request, res: Response, next: NextFunction) {
  if (!config.isProd) return next();
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.path === "/health") return next();
  if (WEBHOOK_PREFIXES.some((p) => req.path.startsWith(p))) return next();

  const origin = req.headers.origin;
  if (!origin) return next();

  if (config.corsOrigins.includes(origin)) return next();

  return res.status(403).json({ error: "Origin not allowed", code: "ORIGIN_FORBIDDEN" });
}

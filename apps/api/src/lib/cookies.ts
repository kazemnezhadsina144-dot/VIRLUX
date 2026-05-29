import type { Response } from "express";
import type { Request } from "express";
import { config } from "./config";

const ACCESS_MAX = 15 * 60;
const REFRESH_MAX = 30 * 24 * 60 * 60;

export const ACCESS_COOKIE = "virlux_access";
export const REFRESH_COOKIE = "virlux_refresh";

export function parseCookies(req: Pick<Request, "headers">): Record<string, string> {
  const raw = req.headers.cookie ?? "";
  const out: Record<string, string> = {};
  for (const part of raw.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1);
    out[key] = decodeURIComponent(val);
  }
  return out;
}

function cookieFlags(maxAge: number): string {
  const secure = config.isProd ? "; Secure" : "";
  const sameSite = config.isProd ? "SameSite=None" : "SameSite=Lax";
  return `Path=/; HttpOnly; ${sameSite}${secure}; Max-Age=${maxAge}`;
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.append("Set-Cookie", `${ACCESS_COOKIE}=${accessToken}; ${cookieFlags(ACCESS_MAX)}`);
  res.append("Set-Cookie", `${REFRESH_COOKIE}=${refreshToken}; ${cookieFlags(REFRESH_MAX)}`);
}

export function clearAuthCookies(res: Response) {
  res.append("Set-Cookie", `${ACCESS_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
  res.append("Set-Cookie", `${REFRESH_COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
}

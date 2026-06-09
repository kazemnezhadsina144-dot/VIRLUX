import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { clearAuthCookies, parseCookies, REFRESH_COOKIE, setAuthCookies } from "../lib/cookies";
import { config } from "../lib/config";
import * as authService from "../services/auth";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  fullName: z.string().min(2),
  companyName: z.string().optional(),
});

function sendAuth(res: import("express").Response, result: Awaited<ReturnType<typeof authService.loginUser>>, status = 200) {
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(status).json(result);
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    if (!config.allowOpenRegistration) {
      return res.status(403).json({ error: "Registration is disabled", code: "REGISTRATION_DISABLED" });
    }
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const result = await authService.registerUser(parsed.data);
    sendAuth(res, result, 201);
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const result = await authService.loginUser(email, password);
    sendAuth(res, result);
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const cookies = parseCookies(req);
    const refreshToken =
      (req.body as { refreshToken?: string }).refreshToken ?? cookies[REFRESH_COOKIE];
    if (!refreshToken) return res.status(400).json({ error: "refreshToken required" });
    const result = await authService.rotateRefreshToken(refreshToken);
    sendAuth(res, result);
  })
);

router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    await authService.logoutUser(req.auth!.userId);
    clearAuthCookies(res);
    res.json({ ok: true });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const me = await authService.getMe(req.auth!.userId);
    res.json(me);
  })
);

export default router;

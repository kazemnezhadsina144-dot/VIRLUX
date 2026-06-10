import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { PORTS } from "@virlux/shared";
import { config, circleConfigured } from "./lib/config";
import { errorHandler } from "./middleware/errorHandler";
import { originGuard } from "./middleware/originGuard";
import telegramRoutes from "./telegram/webhook";
import { pingCircle } from "./integrations/circle/client";
import authRoutes from "./routes/auth";
import quoteRoutes from "./routes/quote";
import transactionRoutes from "./routes/transactions";
import walletRoutes from "./routes/wallet";
import kycRoutes from "./routes/kyc";
import metaRoutes from "./routes/meta";
import auditRoutes from "./routes/audit";
import teamRoutes from "./routes/team";
import accountRoutes from "./routes/account";
import circleRoutes from "./routes/circle";
import platformRoutes from "./routes/platform";
import partnerRoutes from "./routes/partner";
import demoRoutes from "./routes/demo";
import mfaRoutes from "./routes/mfa";
import { botStatus } from "./telegram/polling";

const FORBIDDEN = PORTS.forbidden;
const port = config.port;

if (!process.env.VERCEL && FORBIDDEN.includes(port as 3000 | 8000 | 8020)) {
  console.error(`Port ${port} is forbidden`);
  process.exit(1);
}

const app = express();

// Vercel/Railway sit behind a reverse proxy; required for express-rate-limit (X-Forwarded-For).
if (process.env.VERCEL || process.env.TRUST_PROXY === "1") {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: { maxAge: 31_536_000, includeSubDomains: true },
  })
);
app.use(cors({ origin: config.corsOrigins, credentials: true }));

app.use("/api/telegram", telegramRoutes);
app.use("/api/circle", circleRoutes);

app.use(express.json({ limit: "1mb" }));
app.use(originGuard);

const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

const quoteEstimateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.quoteEstimateRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", async (_req, res) => {
  const body: Record<string, unknown> = {
    status: "ok",
    service: "virlux-api",
    version: "2.2.0",
  };
  if (config.isDev) {
    body.port = port;
    body.env = config.env;
    body.telegram = botStatus();
    body.circle = {
      configured: circleConfigured(),
      reachable: circleConfigured() ? await pingCircle() : false,
    };
  }
  res.json(body);
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/auth/mfa", authLimiter, mfaRoutes);
app.use("/api/quote/estimate", quoteEstimateLimiter);
app.use("/api/quote", quoteRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/demo", demoRoutes);

app.use(errorHandler);

export default app;

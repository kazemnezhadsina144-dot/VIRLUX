const nodeEnv = process.env.NODE_ENV ?? "development";
const isDev = nodeEnv !== "production";
const isProd = !isDev;

function resolveJwtSecret(): string {
  const v = process.env.JWT_SECRET;
  if (isProd) {
    if (!v || v.length < 32) {
      throw new Error("JWT_SECRET must be set (min 32 chars) in production");
    }
    return v;
  }
  return v ?? "dev-secret-change-before-production-min-32-chars!!";
}

/** Dev-only simulated settlement/deposits/KYC — never on in production */
const autoSettle = isDev && process.env.AUTO_SETTLE === "true";

if (isProd && process.env.AUTO_SETTLE === "true") {
  throw new Error("AUTO_SETTLE must not be enabled in production");
}

const telegramMode = (process.env.TELEGRAM_MODE ?? "polling") as "polling" | "webhook";
const telegramWebhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";

if (isProd && telegramMode === "webhook" && (!telegramWebhookSecret || telegramWebhookSecret.length < 16)) {
  throw new Error("TELEGRAM_WEBHOOK_SECRET required (min 16 chars) when TELEGRAM_MODE=webhook in production");
}

export const config = {
  env: nodeEnv,
  isDev,
  isProd,
  port: Number(process.env.PORT ?? 3002),
  jwtSecret: resolveJwtSecret(),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
  jwtRefreshTtlDays: Number(process.env.JWT_REFRESH_TTL_DAYS ?? 30),
  approvalThresholdCad: Number(process.env.APPROVAL_THRESHOLD ?? 5000),
  autoSettle,
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3100,http://localhost:3001")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 120),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramBotName: process.env.TELEGRAM_BOT_NAME ?? "VIRLUXBOT",
  telegramMode,
  telegramWebhookSecret,
  telegramWebhookUrl: process.env.TELEGRAM_WEBHOOK_URL ?? "",
  telegramAdminChatIds: (process.env.TELEGRAM_ADMIN_CHAT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  appPublicUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
  webPublicUrl: process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3100",
  circleApiKey: process.env.CIRCLE_API_KEY ?? "",
  circleSandbox: process.env.CIRCLE_SANDBOX !== "false",
  circleWalletId: process.env.CIRCLE_WALLET_ID ?? "",
};

export function telegramConfigured(): boolean {
  return config.telegramBotToken.length > 10;
}

export function circleConfigured(): boolean {
  return config.circleApiKey.length > 10;
}

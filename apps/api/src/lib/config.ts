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

if (isProd && process.env.ALLOW_OPEN_REGISTRATION === "true") {
  throw new Error("ALLOW_OPEN_REGISTRATION must not be enabled in production");
}

if (isProd && process.env.DEMO_FUND_ENABLED === "true") {
  throw new Error("DEMO_FUND_ENABLED must not be enabled in production");
}

export type SettlementMode = "sandbox" | "direct" | "partner" | "disabled";

function resolveSettlementMode(): SettlementMode {
  const raw = process.env.SETTLEMENT_MODE ?? (isDev ? "sandbox" : "partner");
  if (raw !== "sandbox" && raw !== "direct" && raw !== "partner" && raw !== "disabled") {
    throw new Error("SETTLEMENT_MODE must be sandbox, direct, partner, or disabled");
  }
  if (isProd && raw === "sandbox" && process.env.CIRCLE_SANDBOX === "false") {
    throw new Error("SETTLEMENT_MODE=sandbox is not allowed in production with CIRCLE_SANDBOX=false");
  }
  return raw;
}

const settlementMode = resolveSettlementMode();

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
  approvalThresholdCad: Number(
    process.env.DEMO_APPROVAL_THRESHOLD ?? process.env.APPROVAL_THRESHOLD ?? 5000
  ),
  autoSettle,
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3100,http://localhost:3001")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 120),
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  quoteEstimateRateLimitMax: Number(process.env.QUOTE_ESTIMATE_RATE_LIMIT_MAX ?? 30),
  /** Never open in production — staging uses seeded accounts only */
  allowOpenRegistration: isDev && process.env.ALLOW_OPEN_REGISTRATION !== "false",
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
  circleWebhookSecret: process.env.CIRCLE_WEBHOOK_SECRET ?? "",
  platformAdminEmails: (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
  depositWebhookSecret: process.env.DEPOSIT_WEBHOOK_SECRET ?? "",
  settlementMode,
  /** Require at least one partner-confirmed deposit before sending (always on in prod partner mode) */
  requirePartnerDeposit:
    settlementMode === "partner" ||
    process.env.REQUIRE_PARTNER_DEPOSIT === "true",
  /** Org admins may confirm Interac deposits — disabled in production by default */
  allowOrgDepositConfirm:
    isDev && process.env.ALLOW_ORG_DEPOSIT_CONFIRM !== "false"
      ? true
      : process.env.ALLOW_ORG_DEPOSIT_CONFIRM === "true",
  /** When true, platform admin accounts must enroll TOTP before login succeeds */
  platformAdminMfaRequired: process.env.PLATFORM_ADMIN_MFA_REQUIRED === "true",
};

export function telegramConfigured(): boolean {
  return config.telegramBotToken.length > 10;
}

export function circleConfigured(): boolean {
  return config.circleApiKey.length > 10;
}

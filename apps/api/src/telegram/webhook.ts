import { Router, raw } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { handleMessage } from "./handlers";
import type { TelegramMessage } from "./client";
import { config, telegramConfigured } from "../lib/config";
import { logger } from "../lib/logger";
import { setWebhook, deleteWebhook } from "./client";

const router = Router();

router.post(
  "/webhook",
  raw({ type: "application/json" }),
  asyncHandler(async (req, res) => {
    if (!telegramConfigured()) return res.status(503).json({ error: "Bot not configured" });

    const secret = req.headers["x-telegram-bot-api-secret-token"];
    if (config.telegramMode === "webhook" && secret !== config.telegramWebhookSecret) {
      return res.status(403).json({ error: "Invalid webhook secret" });
    }

    const update = JSON.parse(req.body.toString()) as { message?: TelegramMessage };
    if (update.message) await handleMessage(update.message);
    res.json({ ok: true });
  })
);

router.get(
  "/status",
  asyncHandler(async (_req, res) => {
    res.json({
      configured: telegramConfigured(),
      mode: config.telegramMode,
      webhookUrl: config.telegramWebhookUrl || null,
    });
  })
);

export async function initTelegramTransport() {
  if (!telegramConfigured()) return;

  if (config.telegramMode === "webhook") {
    if (!config.telegramWebhookUrl) {
      logger.error("TELEGRAM_WEBHOOK_URL required for webhook mode");
      return;
    }
    await setWebhook(config.telegramWebhookUrl, config.telegramWebhookSecret || undefined);
    logger.info("Telegram webhook registered", { url: config.telegramWebhookUrl });
  } else {
    await deleteWebhook();
    const { startTelegramBot } = await import("./polling");
    await startTelegramBot();
  }
}

export default router;

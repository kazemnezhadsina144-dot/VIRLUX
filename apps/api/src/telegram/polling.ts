import { deleteWebhook, getUpdates, verifyBot } from "./client";
import { handleMessage } from "./handlers";
import { logger } from "../lib/logger";
import { telegramConfigured } from "../lib/config";

let offset = 0;
let running = false;

export async function startTelegramBot() {
  if (!telegramConfigured()) {
    logger.warn("TELEGRAM_BOT_TOKEN not set; bot disabled");
    return;
  }

  const me = await verifyBot();
  logger.info("Telegram bot connected (polling)", { username: me?.username, id: me?.id });

  await deleteWebhook();

  if (running) return;
  running = true;
  poll();
}

async function poll() {
  while (running) {
    try {
      const updates = await getUpdates(offset);
      for (const u of updates) {
        offset = u.update_id + 1;
        if (u.message) await handleMessage(u.message);
      }
    } catch (e) {
      logger.error("Telegram poll error", { err: String(e) });
      await sleep(3000);
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function stopTelegramBot() {
  running = false;
}

export function botStatus() {
  return { running, configured: telegramConfigured(), offset };
}

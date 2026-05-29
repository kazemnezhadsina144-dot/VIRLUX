import { config, telegramConfigured } from "../lib/config";
import { logger } from "../lib/logger";

const BASE = () => `https://api.telegram.org/bot${config.telegramBotToken}`;

async function call<T>(method: string, body?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json()) as { ok: boolean; result?: T; description?: string };
  if (!data.ok) throw new Error(data.description ?? `Telegram ${method} failed`);
  return data.result as T;
}

export async function verifyBot() {
  if (!telegramConfigured()) return null;
  return call<{ id: number; username: string; first_name: string }>("getMe");
}

export async function deleteWebhook() {
  if (!telegramConfigured()) return;
  await call("deleteWebhook", { drop_pending_updates: true });
}

export async function setWebhook(url: string, secretToken?: string) {
  if (!telegramConfigured()) return;
  await call("setWebhook", {
    url,
    secret_token: secretToken,
    allowed_updates: ["message", "callback_query"],
  });
}

export async function sendMessage(chatId: string | number, text: string, parseMode: "HTML" | "Markdown" = "HTML") {
  if (!telegramConfigured()) return false;
  try {
    await call("sendMessage", {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    });
    return true;
  } catch (e) {
    logger.error("Telegram send failed", { chatId, err: String(e) });
    return false;
  }
}

export async function getUpdates(offset: number) {
  return call<{ update_id: number; message?: TelegramMessage; callback_query?: unknown }[]>("getUpdates", {
    offset,
    timeout: 25,
    allowed_updates: ["message", "callback_query"],
  });
}

export type TelegramMessage = {
  message_id: number;
  chat: { id: number; type: string };
  from?: { id: number; username?: string; first_name?: string };
  text?: string;
};

export { telegramConfigured };

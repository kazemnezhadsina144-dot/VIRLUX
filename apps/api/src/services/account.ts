import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { config } from "../lib/config";

const TOKEN_TTL_MS = 15 * 60 * 1000;

export async function createTelegramLinkToken(userId: string) {
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.user.update({
    where: { id: userId },
    data: { telegramLinkToken: token, telegramLinkTokenExpiresAt: expiresAt },
  });

  return {
    token,
    expiresAt,
    command: `/link ${token}`,
    bot: config.telegramBotName,
  };
}

export async function consumeTelegramLinkToken(token: string, chatId: string, username?: string) {
  const user = await prisma.user.findFirst({
    where: {
      telegramLinkToken: token,
      telegramLinkTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError(400, "Invalid or expired link code", "INVALID_LINK_TOKEN");
  }

  await prisma.telegramLink.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      chatId,
      username: username ?? null,
    },
    update: { chatId, username: username ?? null, linkedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { telegramLinkToken: null, telegramLinkTokenExpiresAt: null },
  });

  return user;
}

import { prisma } from "../lib/prisma";
import { config } from "../lib/config";
import { sendMessage, type TelegramMessage } from "./client";
import { logger } from "../lib/logger";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function notifyAdmins(html: string) {
  for (const chatId of config.telegramAdminChatIds) {
    await sendMessage(chatId, html);
  }
}

export async function notifyUser(userId: string, html: string) {
  const link = await prisma.telegramLink.findUnique({ where: { userId } });
  if (!link) return;
  await sendMessage(link.chatId, html);
}

export async function notifyApproversPending(tx: {
  id: string;
  userId: string;
  amountIn: unknown;
  fromCurrency: string;
  recipientName?: string | null;
}) {
  const sender = await prisma.user.findUnique({
    where: { id: tx.userId },
    include: { organization: { select: { id: true, name: true } } },
  });
  if (!sender?.organizationId) return;

  const approvers = await prisma.user.findMany({
    where: {
      organizationId: sender.organizationId,
      role: { in: ["owner", "admin", "approver"] },
      id: { not: tx.userId },
    },
    select: { id: true, email: true },
  });

  const detailUrl = `${config.appPublicUrl}/dashboard/transactions/${tx.id}`;
  const msg =
    `<b>Approval needed</b>\n` +
    `${tx.amountIn} ${esc(tx.fromCurrency)}` +
    (tx.recipientName ? ` → ${esc(tx.recipientName)}` : "") +
    `\nFrom: ${esc(sender.fullName)}\n` +
    `<a href="${detailUrl}">Review payment</a>`;

  for (const approver of approvers) {
    await notifyUser(approver.id, msg);
  }

  await notifyAdmins(
    `<b>Pending approval</b>\nOrg: ${esc(sender.organization?.name ?? "")}\n${msg.split("\n").slice(1).join("\n")}`
  );
}

export async function notifyTransactionCreated(tx: {
  id: string;
  userId: string;
  amountIn: unknown;
  fromCurrency: string;
  amountOut: unknown;
  toStablecoin: string;
  status: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: tx.userId } });
  const msg =
    `<b>VIRLUX Payment</b>\n` +
    `Ref: <code>${esc(tx.id.slice(0, 12))}</code>\n` +
    `Send: ${tx.amountIn} ${esc(tx.fromCurrency)}\n` +
    `Receive: ${tx.amountOut} ${esc(tx.toStablecoin)}\n` +
    `Status: ${esc(tx.status)}\n` +
    (user ? `User: ${esc(user.email)}` : "");

  await notifyAdmins(msg);
  await notifyUser(tx.userId, `<b>Your payment</b>\n${msg.split("\n").slice(1).join("\n")}`);
}

export async function notifyDepositCompleted(intent: {
  id: string;
  userId: string;
  amountCad: unknown;
  reference: string;
}) {
  const msg =
    `<b>VIRLUX Deposit confirmed</b>\n` +
    `CAD ${intent.amountCad}\n` +
    `Ref: <code>${esc(intent.reference)}</code>`;
  await notifyAdmins(msg);
  await notifyUser(intent.userId, msg);
}

export async function notifyKycUpdate(userId: string, status: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const msg = `<b>KYC ${esc(status)}</b>\n${user ? esc(user.email) : userId}`;
  await notifyAdmins(msg);
  await notifyUser(userId, `<b>Your KYC status:</b> ${esc(status)}`);
}

export async function handleMessage(msg: TelegramMessage) {
  const chatId = msg.chat.id;
  const text = (msg.text ?? "").trim();
  const userId = msg.from?.id;
  const username = msg.from?.username;

  if (!text.startsWith("/")) return;

  const [cmd, ...args] = text.split(/\s+/);
  const command = cmd.split("@")[0].toLowerCase();

  switch (command) {
    case "/start":
      await sendMessage(
        chatId,
        `<b>Welcome to VIRLUX</b>\n\n` +
          `Cross-border B2B payments for Canadian businesses.\n\n` +
          `<b>Commands</b>\n` +
          `/app — Open dashboard\n` +
          `/link &lt;code&gt; — Link chat (code from Settings)\n` +
          `/balance — Wallet balances (linked accounts)\n` +
          `/help — Help\n\n` +
          `Dashboard: ${config.appPublicUrl}`
      );
      break;

    case "/help":
      await sendMessage(
        chatId,
        `<b>VIRLUX Bot</b>\n\n` +
          `/start — Welcome\n` +
          `/app — Dashboard link\n` +
          `/link — Link Telegram (code from dashboard Settings)\n` +
          `/balance — View balances\n` +
          `/status — Platform status (admins)`
      );
      break;

    case "/app":
      await sendMessage(chatId, `Open your VIRLUX dashboard:\n${config.appPublicUrl}`);
      break;

    case "/link": {
      const token = args[0]?.trim();
      if (!token || token.length < 16) {
        await sendMessage(
          chatId,
          "Generate a link code in Settings → Telegram, then send:\n<code>/link YOUR_CODE</code>"
        );
        return;
      }
      try {
        const { consumeTelegramLinkToken } = await import("../services/account");
        const user = await consumeTelegramLinkToken(token, String(chatId), username);
        await sendMessage(chatId, `Linked to <b>${esc(user.email)}</b>. You will receive payment alerts here.`);
        logger.info("Telegram linked via token", { userId: user.id, chatId });
      } catch {
        await sendMessage(chatId, "Invalid or expired link code. Generate a new one in the VIRLUX dashboard.");
      }
      break;
    }

    case "/balance": {
      const link = await prisma.telegramLink.findUnique({ where: { chatId: String(chatId) } });
      if (!link) {
        await sendMessage(chatId, "Link your account first. Generate a code in Settings → Telegram.");
        return;
      }
      const wallet = await prisma.wallet.findUnique({ where: { userId: link.userId } });
      if (!wallet) {
        await sendMessage(chatId, "No wallet found.");
        return;
      }
      await sendMessage(
        chatId,
        `<b>Your balances</b>\n` +
          `CAD: ${wallet.cadBalance}\n` +
          `USD: ${wallet.usdBalance}\n` +
          `USDC: ${wallet.usdcBalance}`
      );
      break;
    }

    case "/status":
      if (userId && !config.telegramAdminChatIds.includes(String(chatId))) {
        await sendMessage(chatId, "Admin only.");
        return;
      }
      {
        const users = await prisma.user.count();
        const txs = await prisma.transaction.count();
        await sendMessage(
          chatId,
          `<b>VIRLUX Status</b>\nUsers: ${users}\nTransactions: ${txs}\nAPI: OK`
        );
      }
      break;

    default:
      await sendMessage(chatId, "Unknown command. Try /help");
  }
}

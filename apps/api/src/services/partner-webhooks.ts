import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

export type PartnerWebhookEvent =
  | "kyc.approved"
  | "kyc.rejected"
  | "deposit.completed"
  | "transaction.instruction"
  | "transaction.confirmed"
  | "transaction.failed";

export async function getPartnerForUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: { include: { partner: true } } },
  });
  return user?.organization?.partner ?? null;
}

export async function emitPartnerWebhook(
  userId: string,
  event: PartnerWebhookEvent,
  payload: Record<string, unknown>
) {
  const partner = await getPartnerForUserId(userId);
  if (!partner?.webhookUrl || !partner.webhookSecret) return;

  const body = JSON.stringify({
    event,
    partnerId: partner.id,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  const signature = crypto.createHmac("sha256", partner.webhookSecret).update(body).digest("hex");

  try {
    const res = await fetch(partner.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Virlux-Signature": signature,
        "X-Virlux-Event": event,
      },
      body,
    });
    if (!res.ok) {
      logger.warn("Partner webhook failed", { partnerId: partner.id, event, status: res.status });
    }
  } catch (e) {
    logger.error("Partner webhook error", { partnerId: partner.id, event, err: String(e) });
  }
}

export function verifyDepositWebhookSignature(rawBody: string, signature: string | undefined): boolean {
  const secret = process.env.DEPOSIT_WEBHOOK_SECRET ?? "";
  if (!secret || secret.length < 16) return false;
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function verifyPartnerSettlementSignature(
  partnerId: string,
  rawBody: string,
  signature: string | undefined
): Promise<boolean> {
  if (!signature) return false;
  const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
  const secret = partner?.webhookSecret ?? "";
  if (!secret || secret.length < 16) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

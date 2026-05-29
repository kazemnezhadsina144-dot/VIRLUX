import { Decimal } from "@prisma/client/runtime/library";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";

type Currency = "CAD" | "USD" | "USDC";
type DbTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const fieldMap: Record<Currency, "cadBalance" | "usdBalance" | "usdcBalance"> = {
  CAD: "cadBalance",
  USD: "usdBalance",
  USDC: "usdcBalance",
};

function d(n: number | string | Decimal): Decimal {
  return n instanceof Decimal ? n : new Decimal(n);
}

function amountStr(amount: number): string {
  return d(amount).toFixed(2);
}

export async function getWallet(userId: string) {
  let wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId } });
  }
  return wallet;
}

async function creditInTx(
  tx: DbTx,
  userId: string,
  currency: Currency,
  amount: number,
  referenceType: string,
  referenceId: string,
  description?: string
) {
  const existing = await tx.ledgerEntry.findFirst({
    where: { referenceType, referenceId, type: "credit" },
  });
  if (existing) {
    return tx.wallet.findUniqueOrThrow({ where: { userId } });
  }

  await tx.wallet.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const field = fieldMap[currency];
  await tx.wallet.update({
    where: { userId },
    data: { [field]: { increment: amountStr(amount) } },
  });

  const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });
  const balanceAfter = d(wallet[field]);

  await tx.ledgerEntry.create({
    data: {
      userId,
      type: "credit",
      currency,
      amount: amountStr(amount),
      balanceAfter: balanceAfter.toString(),
      referenceType,
      referenceId,
      description,
    },
  });

  return wallet;
}

async function debitInTx(
  tx: DbTx,
  userId: string,
  currency: Currency,
  amount: number,
  referenceType: string,
  referenceId: string,
  description?: string
) {
  const existing = await tx.ledgerEntry.findFirst({
    where: { referenceType, referenceId, type: "debit" },
  });
  if (existing) {
    return tx.wallet.findUniqueOrThrow({ where: { userId } });
  }

  await tx.wallet.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const field = fieldMap[currency];
  const updated = await tx.wallet.updateMany({
    where: { userId, [field]: { gte: amountStr(amount) } },
    data: { [field]: { decrement: amountStr(amount) } },
  });

  if (updated.count === 0) {
    throw new AppError(400, `Insufficient ${currency} balance`, "INSUFFICIENT_FUNDS");
  }

  const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });
  const balanceAfter = d(wallet[field]);

  await tx.ledgerEntry.create({
    data: {
      userId,
      type: "debit",
      currency,
      amount: amountStr(amount),
      balanceAfter: balanceAfter.toString(),
      referenceType,
      referenceId,
      description,
    },
  });

  return wallet;
}

export async function credit(
  userId: string,
  currency: Currency,
  amount: number,
  referenceType: string,
  referenceId: string,
  description?: string,
  txClient?: DbTx
) {
  if (txClient) {
    return creditInTx(txClient, userId, currency, amount, referenceType, referenceId, description);
  }
  return prisma.$transaction((tx) =>
    creditInTx(tx, userId, currency, amount, referenceType, referenceId, description)
  );
}

export async function debit(
  userId: string,
  currency: Currency,
  amount: number,
  referenceType: string,
  referenceId: string,
  description?: string,
  txClient?: DbTx
) {
  if (txClient) {
    return debitInTx(txClient, userId, currency, amount, referenceType, referenceId, description);
  }
  return prisma.$transaction((tx) =>
    debitInTx(tx, userId, currency, amount, referenceType, referenceId, description)
  );
}

export async function listLedger(userId: string, limit = 50) {
  return prisma.ledgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

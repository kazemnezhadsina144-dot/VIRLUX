import { prisma } from "../lib/prisma";
import { AppError } from "../lib/errors";
import { buildQuote } from "./rates";

export async function createQuote(input: {
  userId?: string;
  amount: number;
  fromCurrency: "CAD" | "USD";
  toStablecoin: "USDC" | "USDT";
  network: "ethereum" | "polygon" | "solana";
}) {
  const quote = await buildQuote(input);
  const saved = await prisma.quote.create({
    data: {
      userId: input.userId,
      amountIn: input.amount,
      fromCurrency: input.fromCurrency,
      toStablecoin: input.toStablecoin,
      network: input.network,
      midMarketRate: quote.midMarketRate,
      feeAmount: quote.virluxFeeAmount,
      gasEstimateUsd: quote.estimatedGasUsd,
      amountOut: quote.amountOut,
      expiresAt: new Date(quote.expiresAt),
    },
  });
  return { ...quote, quoteId: saved.id };
}

export async function getValidQuote(quoteId: string) {
  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new AppError(404, "Quote not found", "QUOTE_NOT_FOUND");
  if (quote.consumedAt) throw new AppError(410, "Quote already used", "QUOTE_CONSUMED");
  if (quote.expiresAt < new Date()) throw new AppError(410, "Quote expired", "QUOTE_EXPIRED");
  return quote;
}

export async function consumeQuote(quoteId: string) {
  await getValidQuote(quoteId);
  await prisma.quote.update({
    where: { id: quoteId },
    data: { consumedAt: new Date() },
  });
}

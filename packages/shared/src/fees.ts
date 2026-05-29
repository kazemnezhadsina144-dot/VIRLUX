import { PRICING } from "./constants";

export function calculateVirluxFee(amount: number): number {
  return roundMoney((amount * PRICING.flatFeePercent) / 100);
}

export function calculateReceiveAmount(
  amountIn: number,
  midMarketRate: number,
  gasUsd: number,
  fromCurrency: "CAD" | "USD"
): { feeAmount: number; gasUsd: number; amountOut: number } {
  const converted = amountIn * midMarketRate;
  const feeAmount = calculateVirluxFee(converted);
  const gasInFiat = fromCurrency === "CAD" ? gasUsd * 1.36 : gasUsd;
  const amountOut = roundMoney(Math.max(0, converted - feeAmount - gasInFiat));
  return { feeAmount, gasUsd: gasInFiat, amountOut };
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

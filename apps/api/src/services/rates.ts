import { NETWORKS, PRICING } from "@virlux/shared";
import type { NetworkId } from "@virlux/shared";
import { calculateReceiveAmount } from "@virlux/shared";

const COINGECKO_IDS: Record<string, string> = {
  USDC: "usd-coin",
  USDT: "tether",
};

export async function fetchMidMarketRate(
  from: "CAD" | "USD",
  stablecoin: "USDC" | "USDT"
): Promise<number> {
  const usdPerCad = await fetchCadUsd();
  const stableUsd = await fetchStablecoinUsd(stablecoin);

  if (from === "USD") {
    return stableUsd;
  }
  return (1 / usdPerCad) * stableUsd;
}

async function fetchCadUsd(): Promise<number> {
  const res = await fetch("https://api.frankfurter.app/latest?from=CAD&to=USD");
  if (!res.ok) throw new Error("FX rate provider unavailable");
  const data = (await res.json()) as { rates: { USD: number } };
  return data.rates.USD;
}

/** Normalize payment amount to CAD for approval threshold comparison */
export async function toCadEquivalent(amount: number, from: "CAD" | "USD"): Promise<number> {
  if (from === "CAD") return amount;
  const usdPerCad = await fetchCadUsd();
  return amount / usdPerCad;
}

async function fetchStablecoinUsd(coin: "USDC" | "USDT"): Promise<number> {
  const id = COINGECKO_IDS[coin];
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
  );
  if (!res.ok) throw new Error("Market rate provider unavailable");
  const data = (await res.json()) as Record<string, { usd: number }>;
  return data[id]?.usd ?? 1;
}

export function estimateGasUsd(network: NetworkId): number {
  const n = NETWORKS.find((x) => x.id === network);
  return n?.avgGasUsd ?? 1;
}

export async function buildQuote(input: {
  amount: number;
  fromCurrency: "CAD" | "USD";
  toStablecoin: "USDC" | "USDT";
  network: NetworkId;
}) {
  const midMarketRate = await fetchMidMarketRate(input.fromCurrency, input.toStablecoin);
  const gasUsd = estimateGasUsd(input.network);
  const { feeAmount, amountOut } = calculateReceiveAmount(
    input.amount,
    midMarketRate,
    gasUsd,
    input.fromCurrency
  );

  return {
    amountIn: input.amount,
    fromCurrency: input.fromCurrency,
    toStablecoin: input.toStablecoin,
    network: input.network,
    midMarketRate,
    virluxFeePercent: PRICING.flatFeePercent,
    virluxFeeAmount: feeAmount,
    estimatedGasUsd: gasUsd,
    amountOut,
    rateProviders: [...PRICING.rateProviders],
    disclaimer:
      "Indicative rate from live market data. Final rate confirmed at transaction.",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
}

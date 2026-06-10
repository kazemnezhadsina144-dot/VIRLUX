import { NextResponse } from "next/server";
import { calculateReceiveAmount, NETWORKS, PRICING } from "@virlux/shared";
import type { NetworkId } from "@virlux/shared";

const COINGECKO_IDS: Record<string, string> = {
  USDC: "usd-coin",
  USDT: "tether",
};

async function fetchCadUsd(): Promise<number> {
  const res = await fetch("https://api.frankfurter.app/latest?from=CAD&to=USD", {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("FX rate provider unavailable");
  const data = (await res.json()) as { rates: { USD: number } };
  return data.rates.USD;
}

async function fetchStablecoinUsd(coin: "USDC" | "USDT"): Promise<number> {
  const id = COINGECKO_IDS[coin];
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
    { next: { revalidate: 300 } }
  );
  if (!res.ok) throw new Error("Market rate provider unavailable");
  const data = (await res.json()) as Record<string, { usd: number }>;
  return data[id]?.usd ?? 1;
}

async function fetchMidMarketRate(
  from: "CAD" | "USD",
  stablecoin: "USDC" | "USDT"
): Promise<number> {
  const usdPerCad = await fetchCadUsd();
  const stableUsd = await fetchStablecoinUsd(stablecoin);
  if (from === "USD") return stableUsd;
  return (1 / usdPerCad) * stableUsd;
}

function estimateGasUsd(network: NetworkId): number {
  return NETWORKS.find((x) => x.id === network)?.avgGasUsd ?? 1;
}

/** Marketing-site indicative quote — no Railway API required */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      amount?: number;
      fromCurrency?: "CAD" | "USD";
      toStablecoin?: "USDC" | "USDT";
      network?: NetworkId;
    };

    const amount = Number(body.amount);
    const fromCurrency = body.fromCurrency ?? "CAD";
    const toStablecoin = body.toStablecoin ?? "USDC";
    const network = body.network ?? "polygon";

    if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const midMarketRate = await fetchMidMarketRate(fromCurrency, toStablecoin);
    const gasUsd = estimateGasUsd(network);
    const { feeAmount, amountOut } = calculateReceiveAmount(
      amount,
      midMarketRate,
      gasUsd,
      fromCurrency
    );

    return NextResponse.json({
      amountIn: amount,
      fromCurrency,
      toStablecoin,
      network,
      midMarketRate,
      virluxFeePercent: PRICING.flatFeePercent,
      virluxFeeAmount: feeAmount,
      estimatedGasUsd: gasUsd,
      amountOut,
      disclaimer:
        "Indicative rate from live market data. Final rate confirmed at payment.",
      indicative: true,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Quote unavailable";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}

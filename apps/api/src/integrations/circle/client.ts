import { config, circleConfigured } from "../../lib/config";
import { logger } from "../../lib/logger";

const SANDBOX = "https://api-sandbox.circle.com";
const PROD = "https://api.circle.com";

function baseUrl() {
  return config.circleSandbox ? SANDBOX : PROD;
}

async function circleFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${baseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.circleApiKey}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? `Circle API ${res.status}`);
  }
  return data as T;
}

export async function pingCircle(): Promise<boolean> {
  if (!circleConfigured()) return false;
  try {
    await circleFetch("/v1/configuration");
    return true;
  } catch (e) {
    logger.warn("Circle ping failed", { err: String(e) });
    return false;
  }
}

export interface CircleTransferResult {
  id: string;
  status: string;
  transactionHash?: string;
}

/** Sandbox/production USDC transfer skeleton — requires CIRCLE_API_KEY + CIRCLE_WALLET_ID */
export async function transferUsdc(input: {
  amount: string;
  destinationAddress: string;
  idempotencyKey: string;
  network?: "ETH" | "MATIC" | "SOL";
}): Promise<CircleTransferResult> {
  if (!circleConfigured()) {
    throw new Error("Circle not configured");
  }

  const chain = input.network ?? "MATIC";

  const body = {
    idempotencyKey: input.idempotencyKey,
    source: { type: "wallet", id: config.circleWalletId },
    destination: {
      type: "blockchain",
      address: input.destinationAddress,
      chain,
    },
    amount: { amount: input.amount, currency: "USDC" },
  };

  const res = await circleFetch<{ data: CircleTransferResult }>("/v1/transfers", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return res.data;
}

export function isCircleEnabled(): boolean {
  return circleConfigured() && !!config.circleWalletId;
}

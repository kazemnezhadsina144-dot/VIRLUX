/** Normalize API transaction rows for dashboard display */
export type ApiTransaction = {
  id: string;
  amountIn: string | number;
  fromCurrency: string;
  status: string;
  createdAt: string;
  recipientName?: string | null;
  recipientCountry?: string | null;
};

export type DisplayTransaction = {
  id: string;
  amountLabel: string;
  amountCadApprox: number;
  status: string;
  createdAt: string;
  recipientName?: string;
};

const USD_TO_CAD = 1.36;

export function cadEquivalent(amountIn: number, fromCurrency: string): number {
  if (fromCurrency === "USD") return amountIn * USD_TO_CAD;
  return amountIn;
}

export function parseTransactionsResponse(data: unknown): ApiTransaction[] {
  if (Array.isArray(data)) return data as ApiTransaction[];
  if (data && typeof data === "object" && Array.isArray((data as { transactions?: unknown }).transactions)) {
    return (data as { transactions: ApiTransaction[] }).transactions;
  }
  return [];
}

export function toDisplayTransaction(tx: ApiTransaction): DisplayTransaction {
  const amount = Number(tx.amountIn);
  const cad = cadEquivalent(amount, tx.fromCurrency);
  return {
    id: tx.id,
    amountLabel: `${amount.toLocaleString()} ${tx.fromCurrency}`,
    amountCadApprox: cad,
    status: tx.status,
    createdAt: tx.createdAt,
    recipientName: tx.recipientName ?? undefined,
  };
}

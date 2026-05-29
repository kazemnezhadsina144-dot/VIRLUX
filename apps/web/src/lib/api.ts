const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

export async function fetchQuote(body: {
  amount: number;
  fromCurrency: "CAD" | "USD";
  toStablecoin: "USDC" | "USDT";
  network: "ethereum" | "polygon" | "solana";
}) {
  const res = await fetch(`${API}/api/quote/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Quote failed");
  return data;
}

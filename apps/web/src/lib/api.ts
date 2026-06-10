export async function fetchQuote(body: {
  amount: number;
  fromCurrency: "CAD" | "USD";
  toStablecoin: "USDC" | "USDT";
  network: "ethereum" | "polygon" | "solana";
}) {
  // Marketing site uses local Next.js route — no Railway dependency for first impression
  const res = await fetch("/api/quote/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Quote failed");
  return data;
}

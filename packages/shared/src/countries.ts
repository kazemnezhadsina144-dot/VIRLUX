/** Representative corridor list (50+ in marketing; subset for app) */
export const SUPPORTED_COUNTRIES = [
  { code: "CA", name: "Canada", region: "Americas" },
  { code: "US", name: "United States", region: "Americas" },
  { code: "MX", name: "Mexico", region: "Americas" },
  { code: "BR", name: "Brazil", region: "Americas" },
  { code: "GB", name: "United Kingdom", region: "Europe" },
  { code: "DE", name: "Germany", region: "Europe" },
  { code: "FR", name: "France", region: "Europe" },
  { code: "ES", name: "Spain", region: "Europe" },
  { code: "IT", name: "Italy", region: "Europe" },
  { code: "NL", name: "Netherlands", region: "Europe" },
  { code: "NG", name: "Nigeria", region: "Africa" },
  { code: "KE", name: "Kenya", region: "Africa" },
  { code: "ZA", name: "South Africa", region: "Africa" },
  { code: "GH", name: "Ghana", region: "Africa" },
  { code: "IN", name: "India", region: "Asia" },
  { code: "PH", name: "Philippines", region: "Asia" },
  { code: "AU", name: "Australia", region: "Oceania" },
] as const;

export const USE_CASES = [
  {
    id: "suppliers",
    title: "Pay Overseas Suppliers",
    description: "Settle invoices in local currencies without 3–5 day wire delays.",
  },
  {
    id: "payroll",
    title: "Pay Remote Contractors & Teams",
    description: "Send payroll globally with upfront rates and real-time tracking.",
  },
  {
    id: "vendors",
    title: "Manage International Vendors",
    description: "Strengthen supply chains with predictable settlement timelines.",
  },
  {
    id: "trade",
    title: "Execute Cross-Border Trade",
    description: "Move funds quickly to secure inventory and close deals faster.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "Digital Wallet",
    a: "A wallet is where you hold stablecoins and approve transactions. It's like a bank account you fully control.",
  },
  {
    q: "Stablecoin",
    a: "Digital money designed to match a real currency 1:1 (e.g., 1 USDC = $1 USD). Used for fast digital payments.",
  },
  {
    q: "Gas Fee",
    a: "A small network fee paid to process your transaction. Costs vary by network and congestion.",
  },
  {
    q: "On-Ramp / Off-Ramp",
    a: "On-ramp converts bank money into stablecoins. Off-ramp converts stablecoins back to traditional money.",
  },
  {
    q: "KYC",
    a: "A one-time identity check required by law to prevent fraud and money laundering.",
  },
] as const;

/** VIRLUX — same product rules/tune as Kavodax clone spec */

export const COMPANY = {
  legalName: "Virlux Inc.",
  brandName: "VIRLUX",
  foundedYear: 2025,
  address: "2 Simcoe St S Ste 300, Oshawa, ON L1H 8C1",
  email: "contact@virlux.com",
  phone: "(437) 436-0034",
  website: "https://virlux.com",
  appUrl: "https://app.virlux.com",
} as const;

export const COMPLIANCE = {
  /** Do not claim MSB registration until legally verified and number published */
  fintracMsbClaim: false,
  kycTargetBusinessDays: 2,
  roleBasedApprovals: true,
  auditTrail: true,
} as const;

export const PRICING = {
  flatFeePercent: 1,
  rateSources: ["frankfurter", "coingecko"] as const,
  showGasUpfront: true,
  noHiddenFxSpreads: true,
} as const;

export const COVERAGE = {
  /** Corridors currently configured in product — update when expanding */
  supportedCountries: 17,
  depositMethods: ["interac_e_transfer"] as const,
  sendCurrencies: ["CAD", "USD"] as const,
  receiveStablecoins: ["USDC", "USDT"] as const,
} as const;

export const NETWORKS = [
  { id: "ethereum", label: "Ethereum", symbol: "ETH", avgGasUsd: 2.5 },
  { id: "polygon", label: "Polygon", symbol: "MATIC", avgGasUsd: 0.05 },
  { id: "solana", label: "Solana", symbol: "SOL", avgGasUsd: 0.002 },
] as const;

export const SETTLEMENT = {
  targetMinutes: "minutes",
  bankWireDays: "3-5",
  hiddenFxSpreadPercent: "2-5",
} as const;

export const PORTS = {
  web: 3100,
  app: 3001,
  api: 3002,
  postgres: 5432,
  forbidden: [3000, 8000, 8020] as const,
} as const;

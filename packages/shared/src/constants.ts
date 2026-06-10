/** VIRLUX — Canadian B2B cross-border payments; product rules modeled on industry best practices. */

export {
  PUBLIC_COPY,
  POSITIONING,
  CLIENT_COPY,
  formatClientCopy,
  metaDescription,
} from "./public-copy";

export const COMPANY = {
  legalName: "Virlux Inc.",
  brandName: "VIRLUX",
  foundedYear: 2025,
  address: "Vancouver, BC, Canada",
  email: "contact@virlux.com",
  phone: "",
  website: "https://virlux.com",
  appUrl: "https://app.virlux.com",
} as const;

export const COMPLIANCE = {
  /** Flip to true ONLY when MSB registration is verified + counsel approves public MSB # */
  fintracMsbClaim: false,
  kycTargetBusinessDays: 2,
  roleBasedApprovals: true,
  auditTrail: true,
} as const;

/**
 * Public compliance phrases — marketing and legal pages only.
 * Internal messaging strategy lives in todolist/ (never shipped).
 */
export const COMPLIANCE_MESSAGING = {
  publicAllowed: [
    "Compliance built into every payment",
    "Business verification",
    "Role-based approvals",
    "Complete payment history",
    "Built for Canadian businesses",
  ] as const,
  publicForbiddenUntilRegistered: [
    "FINTRAC registered",
    "Registered MSB",
    "Licensed MSB",
    "Licensed money services business",
    "We are an MSB",
  ] as const,
} as const;

/** Public marketing copy — see public-copy.ts and todolist/PUBLIC-BLUEPRINT.md */

export const PRICING = {
  flatFeePercent: 1,
  rateProviders: ["frankfurter", "coingecko"] as const,
  showGasUpfront: true,
  noHiddenFxSpreads: true,
} as const;

/** MSB-sponsored channel fee split (basis points of payment amount in CAD) */
export const PARTNER_PRICING = {
  msbSponsoredTotalBps: 125,
  platformDefaultBps: 90,
  partnerDefaultRevShareBps: 35,
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

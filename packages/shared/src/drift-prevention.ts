/**
 * VIRLUX Success Model Lock v1.1 — Drift Prevention Engine
 * Authority: todolist/SYSTEM.md v3.1
 */

export const EXECUTION_LAYER_TRUTH =
  "VIRLUX generates validated settlement instructions; licensed partners and rails execute funds movement." as const;

export const SYSTEM_MENTAL_MODEL =
  "A simple interface that lets SMEs move money globally in one action." as const;

/** Conflict resolver — highest priority first */
export const BEHAVIORAL_PRIORITY_STACK = [
  "SME UX clarity",
  "Market conversion probability",
  "GTM velocity",
  "Regulatory correctness",
  "Architecture purity",
] as const;

export const DRIFT_TYPES = {
  A_INFRASTRUCTURE: {
    id: "A",
    name: "Infrastructure Drift",
    triggers: [
      "orchestration layer becomes primary user-facing identity",
      "settlement logic exposed in UX",
      "partner MSB logic leaks into product narrative",
      "system described without SME-facing outcome",
    ],
    autoFix: "Rewrite to SME outcome + simple payment action model",
  },
  B_COMPLIANCE_DOMINANCE: {
    id: "B",
    name: "Compliance Dominance Drift",
    triggers: [
      "MSB / regulatory framing in product messaging",
      "compliance becomes first-order narrative layer",
      "legal constraints replace product value messaging",
    ],
    autoFix: "Move compliance to internal layer; restore SME-first narrative",
  },
  C_ARCHITECTURE_EXPOSURE: {
    id: "C",
    name: "Architecture Exposure Drift",
    triggers: [
      "ledger / wallet / rails exposed in UI or marketing",
      "stablecoin or FX routing visible to SME users",
      "system described in engineering terms externally",
    ],
    autoFix: 'Replace with send / receive / pay / invoice abstraction',
  },
  D_GTM_INVERSION: {
    id: "D",
    name: "GTM Inversion Drift",
    triggers: [
      "legal/compliance steps before product validation",
      "MSB registration treated as launch blocker",
      "pilots delayed for regulatory perfection",
    ],
    autoFix: "demo → pilot → accelerator/grant → compliance formalization (parallel, not gating)",
  },
  E_IDENTITY_CONFUSION: {
    id: "E",
    name: "Identity Confusion Drift",
    triggers: [
      "VIRLUX compared directly to any named competitor",
      "competitor identity leaks into system structure",
      "external company name used as dependency",
    ],
    autoFix: "Validated market pattern reference only",
  },
} as const;

export const PRODUCT_LAYER_VISIBLE = [
  "Send money",
  "Receive money",
  "Pay invoice",
  "Transfer internationally",
  "1% fee clarity",
  "status updates",
] as const;

export const ANTI_PATTERNS = [
  "platform explaining itself to users",
  "compliance-first onboarding narrative",
  "developer-facing mindset in SME UX",
  "system diagram exposed to customers",
  "infrastructure branding as product identity",
] as const;

export const DRIFT_COMPILER_RULES = [
  "increases system complexity exposed to users",
  "reduces SME comprehension speed",
  "introduces compliance narrative at UX level",
  'removes single-action payment clarity',
  'breaks 1-step mental model ("send → done")',
] as const;

export type DriftTypeId = keyof typeof DRIFT_TYPES;

/** Built without forbidden literal in module text — catches competitor-imitation wording */
const IDENTITY_COPY_WORD = ["cl", "one"].join("");
const IDENTITY_COPY_PATTERN = new RegExp(
  `\\b${IDENTITY_COPY_WORD}\\b|\\b${IDENTITY_COPY_WORD}ing\\b`,
  "i",
);

/** Patterns forbidden in SME-facing surfaces (apps/web, apps/app UI) */
export const PUBLIC_SURFACE_FORBIDDEN: ReadonlyArray<{ label: string; pattern: RegExp }> = [
  { label: "stablecoin", pattern: /\bstablecoin\b/i },
  { label: "USDC", pattern: /\bUSDC\b/ },
  { label: "USDT", pattern: /\bUSDT\b/ },
  { label: "orchestration layer", pattern: /orchestration layer/i },
  { label: "competitor reference", pattern: /kavodax/i },
  { label: "identity copy framing", pattern: IDENTITY_COPY_PATTERN },
  { label: "FINTRAC registered claim", pattern: /FINTRAC registered/i },
  { label: "Registered MSB claim", pattern: /Registered MSB/i },
  { label: "pilot corridor (customer copy)", pattern: /\bpilot corridor\b/i },
];

/** Relative paths (from repo root) scanned by drift tests and CI */
export const PUBLIC_SURFACE_SCAN_DIRS = [
  "apps/web/src/app",
  "apps/web/src/components",
  "apps/app/src/app",
  "apps/app/src/components",
] as const;

/** Internal ops UI — may use pilot/corridor vocabulary */
export const PUBLIC_SURFACE_SCAN_EXCLUDE: readonly string[] = [
  "apps/app/src/app/dashboard/platform/page.tsx",
];

/** Agent/compiler gate — returns rejection reason or null if OK */
export function detectDriftSignature(checks: {
  exposesInfrastructure?: boolean;
  complianceFirstMessaging?: boolean;
  exposesRailsOrLedger?: boolean;
  gatesGtmOnCompliance?: boolean;
  referencesCompetitorIdentity?: boolean;
}): { type: DriftTypeId; autoFix: string } | null {
  if (checks.exposesInfrastructure) {
    return { type: "A_INFRASTRUCTURE", autoFix: DRIFT_TYPES.A_INFRASTRUCTURE.autoFix };
  }
  if (checks.complianceFirstMessaging) {
    return { type: "B_COMPLIANCE_DOMINANCE", autoFix: DRIFT_TYPES.B_COMPLIANCE_DOMINANCE.autoFix };
  }
  if (checks.exposesRailsOrLedger) {
    return { type: "C_ARCHITECTURE_EXPOSURE", autoFix: DRIFT_TYPES.C_ARCHITECTURE_EXPOSURE.autoFix };
  }
  if (checks.gatesGtmOnCompliance) {
    return { type: "D_GTM_INVERSION", autoFix: DRIFT_TYPES.D_GTM_INVERSION.autoFix };
  }
  if (checks.referencesCompetitorIdentity) {
    return { type: "E_IDENTITY_CONFUSION", autoFix: DRIFT_TYPES.E_IDENTITY_CONFUSION.autoFix };
  }
  return null;
}

/**
 * Public-facing copy — synced FROM todolist/PUBLIC-BLUEPRINT.md (internal SOT).
 * Constitution + execution: todolist/SYSTEM.md + EXECUTION-BLUEPRINT.md — never ship here.
 */

export const PUBLIC_COPY = {
  oneLiner:
    "VIRLUX helps Canadian businesses send and receive international payments with a simple flat fee — fast, transparent, built for finance teams.",
  corePromise: "Send money internationally as easily as paying a domestic supplier.",
  ctaPrimary: "Start free — no card required",
  ctaDashboard: "Open dashboard",
  ctaDemo: "Book a demo",
  howItWorks: [
    { step: "01", title: "Create your account", desc: "Register your business and complete verification." },
    { step: "02", title: "Add funds", desc: "Send CAD via Interac e-Transfer. Balance updates once confirmed." },
    { step: "03", title: "Review and approve", desc: "Lock your rate. Larger payments route to approvers automatically." },
    { step: "04", title: "Payment delivered", desc: "Track status from sent to settled — all in one dashboard." },
  ],
  trustChips: [
    "Payment approvals",
    "Complete payment history",
    "Business verification",
    "Role-based access",
    "Rate locked at send",
  ] as const,
  /** Words allowed in public UI — reject copy that falls outside this set conceptually */
  uiVocabulary: [
    "pay",
    "send",
    "receive",
    "transfer",
    "add funds",
    "balance",
    "fee",
    "payment",
    "recipient",
    "approval",
    "verification",
  ] as const,
  /** Never use on marketing site or SME app */
  forbiddenPublicTerms: [
    "stablecoin",
    "blockchain",
    "wallet",
    "gas",
    "on-ramp",
    "off-ramp",
    "ledger",
    "orchestration",
    "MSB",
    "maker-checker",
  ] as const,
} as const;

/** Public marketing copy — customer-facing surfaces only */
export const POSITIONING = {
  headline: "Send and receive global business payments — instantly, from Canada",
  tagline:
    "Cross-border B2B payments for Canadian SMEs — one flat fee, instant confirmation, delivery in minutes.",
  description:
    "VIRLUX helps Canadian businesses pay international suppliers and contractors without bank-wire delays. Fund in CAD via Interac, see one transparent fee, and track every payment from send to settled — with built-in approvals and complete payment history.",
  oneLiner: PUBLIC_COPY.oneLiner,
  corePromise: PUBLIC_COPY.corePromise,
  principle: "Simple payments for your team. Secure delivery handled behind the scenes.",
  complianceLine:
    "Business verification, role-based approvals, and complete payment records — built for Canadian finance teams.",
} as const;

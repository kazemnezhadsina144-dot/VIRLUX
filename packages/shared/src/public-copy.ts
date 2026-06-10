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

/** SME dashboard copy — synced FROM PUBLIC-BLUEPRINT.md §6 (client layer) */
export const CLIENT_COPY = {
  nav: {
    overview: "Overview",
    send: "Send",
    addFunds: "Add funds",
    payments: "Payments",
    approvals: "Approvals",
    team: "Team",
    verification: "Verification",
    activityLog: "Activity log",
    settings: "Settings",
    platformOps: "Platform ops",
  },
  send: {
    title: "Send payment",
    subtitle: "Pay international suppliers in one step — {fee}% flat fee, confirmed upfront.",
    destinationCountry: "Destination country",
    recipientName: "Recipient name",
    paymentReference: "Payment reference / invoice # (optional)",
    payoutDetailsSummary: "Recipient payout details (if required)",
    payoutReferencePlaceholder: "Bank or payout reference",
    confirmRate: "Confirm rate",
    sendPayment: "Send payment",
    approvalNotice:
      "Payments over {amount} CAD require an approver on your team before processing.",
    destinationLocked: "Your account is set up for payments to {country}.",
    recipientReceives: "Recipient receives ≈ {amount} (estimated)",
    feeLine: "VIRLUX fee ({fee}%): {amount} {currency}",
    confirmRateFirst: "Confirm your rate first",
    paymentSent: "Payment sent — status: {status}",
  },
  overview: {
    title: "Overview",
    welcome: "Welcome back",
    cadBalance: "CAD balance",
    verification: "Verification",
    completeVerification: "Complete verification →",
    addFunds: "Add funds →",
    approvalsNeeded: "{count} payment needs your approval →",
    approvalsNeededPlural: "{count} payments need your approval →",
    recentPayments: "Recent payments",
    viewAll: "View all payments →",
  },
  gettingStarted: {
    label: "Getting started",
    progress: "{done} of {total} complete",
    steps: [
      { label: "Verify your business", href: "/dashboard/kyc" },
      { label: "Add funds via Interac", href: "/dashboard/deposits" },
      { label: "Send your first payment", href: "/dashboard/send" },
      { label: "Track payment status", href: "/dashboard/transactions" },
    ],
  },
  payments: {
    title: "Payments",
    subtitle: "Track status and history for every international payment.",
    emptyTitle: "No payments yet",
    emptyDescription: "Send your first international payment from the Send page.",
    emptyAction: "Send payment",
    viewAllLink: "View all payments →",
    backToList: "← Back to payments",
    detailTitle: "Payment {id}…",
    actionRequired: "Action required",
    approvePayment: "Approve payment",
    rejectPayment: "Reject",
    cancelPayment: "Cancel my payment",
    paymentApproved: "Payment approved.",
    paymentRejected: "Payment rejected. Funds refunded.",
    paymentCancelled: "Payment cancelled. Funds refunded.",
    defaultRecipient: "International payment",
    loadFailed: "Could not load this payment. Try again.",
    notFound: "Payment not found.",
  },
  approvals: {
    title: "Approvals",
    subtitle: "Payments waiting for your review before processing.",
    roleDenied: "Your role cannot approve payments.",
    emptyTitle: "No pending approvals",
    emptyDescription: "Payments over your threshold will appear here.",
    viewAllLink: "View all payments →",
  },
  deposits: {
    title: "Add funds",
    subtitle: "Fund your account via Interac e-Transfer",
    amountLabel: "Amount (CAD)",
    generateInstructions: "Generate Interac instructions",
    demoFunds: "Add demo funds instantly",
    referenceLabel: "Reference (use in Interac message):",
    copyReference: "Copy reference",
    pendingTitle: "Pending Interac confirmations",
    pendingHint: "Mark received after verifying bank deposit",
    confirmReceived: "Confirm received",
    historyTitle: "Deposit history",
    historyEmpty: "No deposits yet",
  },
  verification: {
    title: "Business verification",
    subtitle: "Required before you can send payments or add funds",
    documentUploadHint:
      "Document upload: attach via email to support if counsel requires certified copies.",
    documentUploadDisabled: "Upload coming with counsel review",
    submitDocuments: "Submit documents",
    submissionHistory: "Your submission history",
  },
  sendLoading: {
    confirmingRate: "Confirming rate…",
    sendingPayment: "Sending payment…",
  },
  legalFooterDisclaimer: "Not financial or legal advice. Built for Canadian business payments.",
  calculatorDisclaimer:
    "Estimate only. Live rates and fees are confirmed in your dashboard before you send.",
  productPreviewCaption: "Dashboard preview — sign in to explore send, approvals, and payment history.",
} as const;

/** Meta description — tagline + one-liner, capped for OG */
export function metaDescription(maxLen = 160): string {
  const full = `${POSITIONING.tagline} ${PUBLIC_COPY.oneLiner}`;
  return full.length <= maxLen ? full : `${full.slice(0, maxLen - 1)}…`;
}

export function formatClientCopy(
  template: string,
  vars: Record<string, string | number>
): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    template
  );
}

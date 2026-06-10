/** Representative destination markets for Canadian B2B payments */
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
    title: "Pay international suppliers",
    description: "Settle invoices abroad without multi-day wire delays or opaque FX spreads.",
  },
  {
    id: "payroll",
    title: "Pay contractors and remote teams",
    description: "Send global payroll with locked rates, clear fees, and live payment tracking.",
  },
  {
    id: "vendors",
    title: "Manage vendor payments",
    description: "Keep supply chains moving with predictable timelines and full visibility.",
  },
  {
    id: "trade",
    title: "Support cross-border trade",
    description: "Pay partners quickly to secure inventory and close deals with confidence.",
  },
] as const;

/** Business-facing FAQ — no crypto or infrastructure vocabulary */
export const FAQ_ITEMS = [
  {
    q: "How fast do international payments settle?",
    a: "Most payments are processed within minutes after any required approval. Timing can vary by destination and banking partner.",
  },
  {
    q: "What are your fees?",
    a: "VIRLUX charges a flat 1% fee on cross-border payments. You see the full cost—including exchange rate—before you confirm.",
  },
  {
    q: "How do I fund my account?",
    a: "Canadian businesses can add CAD via Interac e-Transfer using the reference shown in your dashboard. USD funding is also supported where available.",
  },
  {
    q: "Do I need approval from my team?",
    a: "Yes, for amounts above your company threshold. Owners and admins can configure who sends and who approves payments.",
  },
  {
    q: "Is VIRLUX secure and compliant?",
    a: "Every payment is logged with role-based access and business verification. Records are built for Canadian AML and audit requirements.",
  },
  {
    q: "Which countries can I pay?",
    a: "VIRLUX supports major business destinations across the Americas, Europe, Africa, Asia, and Oceania—with more added regularly.",
  },
] as const;

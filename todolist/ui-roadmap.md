# UI roadmap — Canadian B2B fintech (2026)

## Done (2026-05-29)

### Marketing site (`localhost:3100`)

**Design system**
- Plus Jakarta Sans typography
- Deep navy palette, blue glow accents
- Glass cards, grid hero, `btn-primary` / `btn-secondary`

**Sales structure**
- Sticky header — Sign in + Open dashboard CTA
- Hero — Canadian B2B positioning, trust bullets, dual CTAs
- Live calculator — savings vs bank wire (~2.5% hidden FX), fee breakdown, CTA to app
- Stats bar — settlement time, 1% fee, corridors, Interac on-ramp
- Product pillars — Interac, upfront FX, team controls
- 4-step flow — Register → Interac → Approve → Settle
- Bank vs VIRLUX comparison table
- Corridor pills — 17 supported countries
- Pricing card — 1% flat + feature checklist
- FAQ accordion
- Demo CTA band — dashboard + Book a demo mailto
- Footer — Ontario address, compliance note

### Dashboard app (`localhost:3001`)

- Split-screen login — brand panel + form (demo hint dev-only)
- Sidebar — logo, user/org, role badge, active nav
- Overview — quick actions, approval banner, gradient stat tiles, status badges
- Role-gated nav — viewers hidden from Send/Deposits/Team/Audit
- Settings — Telegram one-time link code
- Shared visual tokens with marketing

---

## Open — marketing

| Status | Item |
|--------|------|
| open | Light-mode variant |
| open | Animated corridor map |
| open | Dedicated `/pricing` page for paid ads |
| open | Terms of Service page (`/terms`) |
| open | Full PIPEDA privacy policy (expand stub) |

---

## Open — dashboard

| Status | Item |
|--------|------|
| open | KYC admin review UI (approve/reject) |
| open | Org-wide pending approval queue polish |
| open | Approve/reject on transaction detail page |
| open | Next.js middleware server-side auth gate (beyond client `hasSession`) |
| open | Security headers (CSP, HSTS) in `next.config` |

---

## Open — conversion / sales

| Status | Item |
|--------|------|
| open | “Book a demo” → CRM or Calendly instead of mailto only |
| open | Case studies / logo strip (when customers exist) |
| open | MSB registration badge (only when legally registered) |

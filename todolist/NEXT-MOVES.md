# VIRLUX — Next moves (master action list)

**Last reviewed:** 2026-05-29  
**Branch:** `cursor/virlux-v2-platform-and-todolist`  
**Purpose:** Single prioritized list of what to **do**, **fix**, and **decide** next.

Status: `🔴 blocker` | `🟠 high` | `🟡 medium` | `🟢 nice` | `✅ done`

---

## Phase 0 — Run it locally (do this first)

| Pri | Status | Action | Owner | Notes |
|-----|--------|--------|-------|-------|
| 🟠 | open | Install/start **Postgres** (`docker compose up -d postgres`) | Dev | Docker required on your Mac |
| 🟠 | open | `unset DATABASE_URL` if shell still has old SQLite URL | Dev | Common Prisma failure |
| 🟠 | open | `npm run db:migrate && npm run db:seed` | Dev | Demo user + balances |
| 🟠 | open | `npm run dev` — verify **3100**, **3001**, **3002** | Dev | Use `npm run dev:web` if marketing alone breaks |
| 🟡 | open | Run `npm test && npm run build` before any deploy | Dev | 10 tests as of 2026-05-29 |

**Demo login:** `demo@virlux.com` / `demo12345` (dev seed only)

---

## Phase 1 — Before real money (launch blockers)

### Money & compliance (code + ops)

| Pri | Status | Action | Where to fix | Effort |
|-----|--------|--------|--------------|--------|
| 🟠 | in-progress | **Interac deposit confirmation** — admin manual confirm done; bank webhook still needed | `wallet.ts`, `dashboard/deposits` | M |
| ✅ | done | **KYC review** — API + dashboard queue for owner/admin | `routes/kyc.ts`, `dashboard/kyc` | M |
| 🔴 | in-progress | **httpOnly cookie auth** — cookies + app `/api` proxy; counsel review for prod cross-domain | `apps/api`, `apps/app` | M |
| 🟠 | in-progress | **Circle production** — sandbox checklist + transfer polling added | `integrations/circle/` | L |
| 🟠 | draft | **Legal pages** — `/terms`, expanded `/privacy` (counsel review required) | `apps/web` | M |
| ✅ | done | **Refresh token reuse detection** — revoke token family on reuse | `services/auth.ts` | S |
| 🟠 | open | **Real Interac provider** — replace dev auto-complete | New integration | XL |

### Infrastructure & deploy

| Pri | Status | Action | Where | Effort |
|-----|--------|--------|-------|--------|
| 🔴 | open | **Production env checklist** — `AUTO_SETTLE=false`, JWT, webhook, CORS | Railway + Vercel | S |
| 🔴 | ready | **Deploy Postgres + API** on Railway (`migrate deploy`, no seed) | `railway.toml`, `todolist/staging-deploy.md` | S |
| 🟠 | ready | **Deploy marketing + app** on Vercel (two projects) | `vercel.json`, `.env.staging.example` | S |
| 🟠 | done | **Deploy runbook** — step-by-step in `todolist/staging-deploy.md` | docs | S |
| 🟡 | open | Secret scanning in CI | `.github/workflows/ci.yml` | S |

---

## Phase 2 — Product polish (dashboard & UX)

| Pri | Status | Action | Where | Effort |
|-----|--------|--------|-------|--------|
| ✅ | done | **Transaction detail** — Approve / Reject / Cancel on detail page | `dashboard/transactions/[id]` | S |
| ✅ | done | **Pending approvals queue** — filter org-wide awaiting_approval | `dashboard/transactions` | S |
| 🟠 | done | **Server-side auth gate** — Next.js middleware on `/dashboard/*` | `apps/app/src/middleware.ts` | M |
| 🟡 | done | **Security headers** — CSP-adjacent headers on web + app | `next.config.ts` | S |
| 🟡 | done | **`/pricing` page** for ads/conversion | `apps/web/pricing` | S |
| ✅ | done | **Deposit admin confirm** — manual “mark Interac received” for ops | API + `dashboard/deposits` | M |

---

## Phase 3 — Marketing & growth (post-MVP)

| Pri | Status | Action | Effort |
|-----|--------|--------|--------|
| 🟡 | open | Dedicated **`/pricing`** page for paid ads | ✅ done |
| 🟡 | open | **Book a demo** → Calendly/HubSpot instead of mailto | S |
| 🟢 | open | Light-mode variant | M |
| 🟢 | open | Animated corridor map | M |
| 🟢 | open | Customer logo strip / case studies | M (needs customers) |
| 🟢 | open | MSB registration badge on site | S (only when registered) |

---

## Phase 4 — Quality & scale

| Pri | Status | Action | Effort |
|-----|--------|--------|--------|
| 🟡 | open | **E2E tests** (Playwright): login → quote → send | L |
| 🟡 | open | **Dual approval** above higher CAD threshold | M |
| 🟡 | open | Expand corridors beyond 17 countries | Ongoing |
| 🟢 | open | OWASP / dependency audit in CI | S |

---

## Already done (don’t redo)

| Item |
|------|
| ✅ PostgreSQL + migrations + Docker Compose |
| ✅ Ledger atomicity, quote consume, no double-spend |
| ✅ Settlement fix (no USDC inflation; Circle fail → refund) |
| ✅ `AUTO_SETTLE` dev-only; blocked in prod |
| ✅ Maker-checker approvals, org-scoped audit |
| ✅ Telegram token-based link (not email hijack) |
| ✅ Role-gated send/deposit/approve |
| ✅ Marketing UI v2026 + dashboard polish |
| ✅ `dev:safe` for port 3100 stale Next.js |
| ✅ `todolist/` tracking folder |
| ✅ CI: build + unit tests + migrate deploy |
| ✅ Demo seed gated from production Dockerfile |
| ✅ Sprint B — KYC review queue, Interac admin confirm, tx approve/reject/cancel UI |
| ✅ Sprint C prep — staging runbook, env template, smoke scripts, Vercel config |
| ✅ Strategic build — legal drafts, GTM docs, cookie auth, Circle polling, middleware |

---

## Recommended order (next 3 sprints)

### Sprint A — “It runs end-to-end locally”
1. Postgres + migrate + seed + full `npm run dev`
2. Walkthrough: register → KYC (dev auto) → deposit → quote → send → approve
3. Fix any bugs found in that flow

### Sprint B — “Ops can run compliance” ✅
1. ✅ KYC approve/reject API + dashboard UI
2. ✅ Interac manual confirm (admin marks deposit received)
3. ✅ Transaction approve/reject/cancel on detail page + pending filter

### Sprint C — “Staging deploy” ← **execute in Railway/Vercel**
1. Railway API + Postgres — follow [staging-deploy.md](./staging-deploy.md)
2. Vercel web + app with `NEXT_PUBLIC_API_URL`
3. Telegram webhook mode on Railway
4. Circle sandbox end-to-end on staging
5. `npm run deploy:smoke` after URLs are live

---

## Decisions needed (founder)

| Decision | Options | Blocks |
|----------|---------|--------|
| Interac partner | Manual ops first vs bank/API integration | Real CAD on-ramp |
| Auth model | Cookie BFF vs NextAuth vs custom | Production launch |
| Circle go-live | Sandbox only vs prod wallet | Real USDC settlement |
| MSB status | Register before marketing claim vs stay generic | Public compliance copy |
| Hosting | Railway + Vercel confirmed? | Deploy sprint |

---

## Rules (do not break)

- **TrustField Technologies** — do not modify unless explicitly asked
- **Telegram** — @VIRLUXBOT only in this repo
- **Ports** — never use 3000, 8000, 8020
- **Demo account** — never in production deploy path

---

## Quick links

- [Launch blockers](./launch-blockers.md)
- [Local dev runbook](./local-dev.md)
- [UI roadmap](./ui-roadmap.md)
- [Staging deploy](./staging-deploy.md)
- [Ops & debugging](./ops-and-debugging.md)
- [Compliance & legal](./compliance-and-legal.md)
- [Backlog](./backlog.md)

**Effort key:** S = hours · M = 1–2 days · L = 3–5 days · XL = 1+ weeks

# Live deploy runbook (Live Pilot Readiness — Phase 0)

Founder-only steps to go from `main` to live URLs. Engineering prerequisites are on `main`; this doc is the execution checklist.

## Current live URLs (2026-06-04)

| Surface | URL | Status |
|---------|-----|--------|
| Marketing | https://virlux-web.vercel.app | Live (Live Pilot build) |
| Dashboard | https://virlux-app.vercel.app | Live (Live Pilot build) |
| API | https://virlux-api.vercel.app | Live — `/health`, `/api/meta/config`, auth (Prisma `engineType = library` on Vercel) |

Custom domains (`virlux.com`, `app.virlux.com`) — point DNS to Vercel projects above.

## Current blockers (2026-06-04)

Last verified: `npm run deploy:smoke` + demo login — all green.

| # | Blocker | Impact | Owner action |
|---|---------|--------|--------------|
| **B1** | ~~DATABASE_URL / Prisma on Vercel~~ | **Cleared** — `engineType = library` + `DATABASE_URL` on virlux-api | Redeploy: `npm run staging:vercel-api` |
| **B2** | **`RAILWAY_TOKEN` optional** — old `virlux-api-production.up.railway.app` is 404 | No longer required for pilot; use Vercel API URL | Optional: `RAILWAY_TOKEN=... npm run staging:railway` if you prefer Railway |
| **B3** | **`.env.staging` not loaded** in shell | Pre-flight/smoke fail without exports | `STAGING_API_URL=https://virlux-api.vercel.app STAGING_WEB_URL=... STAGING_APP_URL=... bash scripts/staging-prepare-env.sh` |
| **B4** | **Custom DNS not wired** | Public URLs still `*.vercel.app` | Point DNS to `virlux-web` / `virlux-app` (see §4) |
| **B5** | **Playwright live-e2e** locally | `post-deploy:verify` needs `npx playwright install` on dev machine | Not a deploy blocker; run after browser install |

**What works today (not blocked):**

| Surface | URL | Status |
|---------|-----|--------|
| Marketing (Vercel) | https://virlux-web.vercel.app | 200 OK |
| Dashboard UI (Vercel) | https://virlux-app.vercel.app | 200 OK |
| Hero quote (web-only) | `POST /api/quote/estimate` on marketing | OK — Frankfurter/CoinGecko via Next.js route; no Railway required for homepage calculator |

**Unblock sequence (minimum — Vercel path):**

1. `npm run staging:vercel-api` — API at https://virlux-api.vercel.app
2. `bash scripts/staging-wire-production.sh https://virlux-api.vercel.app`
3. Add `VIRLUX_STAGING_DB_PASSWORD` to `~/.sina/secrets.env` → `bash scripts/staging-supabase-db-url.sh` → `npm run staging:vercel-api-env` → `npm run staging:vercel-api`
4. `bash scripts/staging-platform-setup.sh` (after DB live)
5. `npm run post-deploy:verify`

**Railway (optional):** `RAILWAY_TOKEN=... npm run staging:railway` then wire that URL instead.

**Ecosystem note:** Sibling repos may run their own readiness checks in parallel; VIRLUX DELIVERY ships on ports `3100/3001/3002` on this monorepo only.

## Prerequisites

- [ ] Pre-flight: `npm run live-pilot:deploy-check` (tokens + `.env.staging`)
- [ ] `RAILWAY_TOKEN` and `VERCEL_TOKEN` in your shell
- [ ] `.env.staging` prepared: `bash scripts/staging-prepare-env.sh`
- [ ] `VIRLUX_STAGING_DB_PASSWORD` in `~/.sina/secrets.env` (Supabase `virlux-staging` project `bueoakgiisvufxfbdvoa`)

## 1. Deploy

**Primary (Vercel API — no Railway token):**

```bash
cd /path/to/Virlux
STAGING_WEB_URL=https://virlux-web.vercel.app STAGING_APP_URL=https://virlux-app.vercel.app \
  STAGING_API_URL=https://virlux-api.vercel.app bash scripts/staging-prepare-env.sh
npm run staging:vercel-api
npm run staging:vercel-api-env   # after DATABASE_URL set (see B1)
bash scripts/staging-wire-production.sh https://virlux-api.vercel.app
npm run staging:vercel           # redeploy web + app with NEXT_PUBLIC_API_URL
```

**Optional (Railway):**

```bash
RAILWAY_TOKEN=... VERCEL_TOKEN=... npm run staging:deploy-all
```

## 2. Railway API env

| Variable | Value |
|----------|--------|
| `SETTLEMENT_MODE` | `partner` |
| `AUTO_SETTLE` | `false` |
| `DEMO_APPROVAL_THRESHOLD` | `100` (staging demos) |
| `DEMO_FUND_ENABLED` | `true` (staging only) |
| `PLATFORM_ADMIN_EMAILS` | `contact@virlux.com,demo@virlux.com` |
| `CORS_ORIGINS` | both Vercel URLs, no trailing slash |

## 3. Vercel — `virlux-web` + `virlux-app`

**Monorepo deploy (2026-06-04):**

- **virlux-app** — Vercel project Root Directory = `apps/app` → run deploy from **repository root** (`npx vercel deploy --cwd . --prod`). Do not `cd apps/app` (doubles path to `apps/app/apps/app`).
- **virlux-web** — Vercel project **Root Directory** = `apps/web` (dashboard). Deploy via `npm run staging:vercel` (repo root + `vercel.web.json` swap). Do not deploy with default root `vercel.json` (API build).

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Railway API URL — **must be real** (fixes proxy DNS errors) |
| `NEXT_PUBLIC_APP_URL` | `https://app.virlux.com` or Vercel app URL |
| `NEXT_PUBLIC_WEB_URL` | `https://virlux.com` or Vercel web URL |
| `NEXT_PUBLIC_BOOK_DEMO_URL` | Calendly link |
| `NEXT_PUBLIC_DEMO_LOOM_URL` | Loom embed URL (web only) |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | Optional Plausible domain |
| `NEXT_PUBLIC_DEMO_MODE` | `true` on **app staging only** — never production |

## 4. DNS

- `virlux.com` → Vercel web project
- `app.virlux.com` → Vercel app project

## 5. Seed staging (once)

```bash
# Against staging DB (DIRECT_URL in .env.staging):
SEED_DATABASE=true DEMO_SEED_PASSWORD="$DEMO_SEED_PASSWORD" npm run db:seed -w @virlux/api
```

Accounts: `demo@virlux.com`, `approver@virlux.demo` — password from `DEMO_SEED_PASSWORD` (Tier 3, in `~/.sina/secrets.env`)

## 6. Platform setup

```bash
STAGING_API_URL=https://virlux-api.vercel.app \
PLATFORM_ADMIN_EMAIL=demo@virlux.com PLATFORM_ADMIN_PASSWORD="$DEMO_SEED_PASSWORD" \
ORG_ID=seed-org-demo PILOT_CORRIDOR=PH \
bash scripts/staging-platform-setup.sh
```

## 7. Verify

```bash
# Single command (loads .env.staging URLs when present):
npm run post-deploy:verify

# Or manually:
npm run deploy:smoke
STAGING_APP_URL=https://app.virlux.com STAGING_WEB_URL=https://virlux.com npm run staging:live-e2e
npm run staging:partner-e2e
```

## 8. Founder media (Phase 0 eng deliverable)

1. Record 5-min Loom → set `NEXT_PUBLIC_DEMO_LOOM_URL`
2. Replace `apps/web/public/screenshots/*.svg` with live PNG captures after deploy
3. Rehearse scripts in [DEMO-SCRIPTS.md](./DEMO-SCRIPTS.md)

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/api/health` → DNS error on app | Wrong `NEXT_PUBLIC_API_URL` on Vercel app |
| Web 404 | Deploy `virlux-web` project; root dir `apps/web` |
| Login works but send fails CORRIDOR | Run platform setup; default demo org is PH |
| Approvals empty at $150 | Set `DEMO_APPROVAL_THRESHOLD=100` on Railway |

# Live deploy runbook (Live Pilot Readiness — Phase 0)

Founder-only steps to go from `main` to live URLs. Engineering prerequisites are on `main`; this doc is the execution checklist.

## Prerequisites

- [ ] Pre-flight: `npm run live-pilot:deploy-check` (tokens + `.env.staging`)
- [ ] `RAILWAY_TOKEN` and `VERCEL_TOKEN` in your shell
- [ ] `.env.staging` prepared: `bash scripts/staging-prepare-env.sh`
- [ ] Real `DATABASE_URL` on Railway Postgres

## 1. Deploy

```bash
cd /path/to/Virlux
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
# On Railway API service or local against staging DB:
SEED_DATABASE=true npm run db:seed -w @virlux/api
```

Accounts: `demo@virlux.com` / `demo12345`, `approver@virlux.demo` / `demo12345`

## 6. Platform setup

```bash
STAGING_API_URL=https://your-api.up.railway.app \
PLATFORM_ADMIN_EMAIL=demo@virlux.com PLATFORM_ADMIN_PASSWORD=demo12345 \
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

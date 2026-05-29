# Staging deploy runbook (Sprint C)

**Target:** Railway (API + Postgres) + Vercel (marketing + dashboard)  
**Last updated:** 2026-05-29  
**Status:** Ready to execute — requires founder Railway/Vercel accounts

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Vercel         │     │  Vercel         │
│  apps/web       │     │  apps/app       │
│  (marketing)    │     │  (dashboard)    │
└────────┬────────┘     └────────┬────────┘
         │  NEXT_PUBLIC_API_URL   │
         └───────────┬────────────┘
                     ▼
         ┌───────────────────────┐
         │  Railway              │
         │  apps/api (Docker)    │
         │  + Postgres plugin    │
         └───────────────────────┘
                     │
         Telegram webhook → /api/telegram/webhook
         Circle sandbox → USDC settlement
```

**Do not** run `db:seed` on staging/production — no `demo@virlux.com` in deploy path.

---

## Prerequisites

- [ ] GitHub repo pushed (branch merged or deploy from feature branch)
- [ ] Railway account + project
- [ ] Vercel account (two projects)
- [ ] Telegram bot token for **@VIRLUXBOT**
- [ ] Circle sandbox API key + wallet ID (optional for first smoke test)

Copy env template: `.env.staging.example`  
Generate secrets locally:

```bash
./scripts/generate-staging-secrets.sh
```

---

## Step 1 — Railway Postgres

1. Create Railway project → **Add PostgreSQL**
2. Copy `DATABASE_URL` from Postgres service variables
3. Keep Postgres and API in the **same project** (private networking)

---

## Step 2 — Railway API

1. **New service** → Deploy from GitHub repo
2. Settings:
   - **Root directory:** repo root (default)
   - **Config file:** `railway.toml` (uses `apps/api/Dockerfile`)
3. Link `DATABASE_URL` from Postgres service (reference variable)
4. Set environment variables (see `.env.staging.example`):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | yes | From Postgres plugin |
| `JWT_SECRET` | yes | Min 32 chars |
| `AUTO_SETTLE` | yes | **`false`** on staging |
| `CORS_ORIGINS` | yes | Both Vercel URLs, comma-separated |
| `TELEGRAM_MODE` | yes | `webhook` |
| `TELEGRAM_BOT_TOKEN` | yes | @VIRLUXBOT |
| `TELEGRAM_WEBHOOK_URL` | yes | `https://<api-host>/api/telegram/webhook` |
| `TELEGRAM_WEBHOOK_SECRET` | yes | Min 16 chars; sent as Telegram secret token |
| `CIRCLE_API_KEY` | optional | Sandbox key |
| `CIRCLE_WALLET_ID` | optional | Sandbox wallet |
| `CIRCLE_SANDBOX` | optional | `true` |
| `NEXT_PUBLIC_APP_URL` | recommended | Dashboard Vercel URL |
| `NEXT_PUBLIC_WEB_URL` | recommended | Marketing Vercel URL |

5. Deploy — Dockerfile runs `prisma migrate deploy` then starts API on port **3002**
6. Verify:

```bash
curl -s https://YOUR-API.up.railway.app/health | jq
# → { "status": "ok", "service": "virlux-api", ... }
```

7. Telegram status:

```bash
curl -s https://YOUR-API.up.railway.app/api/telegram/status | jq
```

---

## Step 3 — Vercel marketing (`apps/web`)

1. **Import** repo → New Project
2. **Root Directory:** `apps/web`
3. Framework: Next.js (auto-detected)
4. Build uses `apps/web/vercel.json` (installs from monorepo root)
5. Environment variables (Production + Preview):

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Railway API URL |
| `NEXT_PUBLIC_WEB_URL` | This project's Vercel URL |
| `NEXT_PUBLIC_APP_URL` | Dashboard Vercel URL |

6. Deploy → open marketing URL → converter should load live quote from API

---

## Step 4 — Vercel dashboard (`apps/app`)

1. **Second** Vercel project from same repo
2. **Root Directory:** `apps/app`
3. Same `NEXT_PUBLIC_*` env vars as web project
4. Deploy → register a **new** org (do not rely on demo seed)

---

## Step 5 — Wire CORS after URLs are known

Update Railway `CORS_ORIGINS` with final Vercel URLs:

```
CORS_ORIGINS=https://virlux-web-xxx.vercel.app,https://virlux-app-xxx.vercel.app
```

Redeploy API if CORS was placeholder during first deploy.

---

## Step 6 — Smoke test

```bash
export NEXT_PUBLIC_API_URL=https://YOUR-API.up.railway.app
export STAGING_WEB_URL=https://YOUR-WEB.vercel.app
export STAGING_APP_URL=https://YOUR-APP.vercel.app
npm run deploy:smoke
npm run staging:e2e    # register → me → kyc → quote
npm run staging:circle # Circle sandbox reachability
```

**GitHub Actions (after push to GitHub):**

- **Staging smoke:** Actions → "Staging smoke" → Run workflow → enter API URL
- **Staging E2E:** Actions → "E2E staging API" → enter API URL
- **Playwright:** runs on push to `main` via `.github/workflows/e2e.yml`

### Manual E2E (staging)

1. Register new account on dashboard Vercel URL
2. Submit KYC → approve as org owner (or invite admin)
3. Create Interac deposit → confirm as admin (manual ops path)
4. Get quote → send payment → approve if over threshold
5. With Circle sandbox configured: confirm settlement reaches `confirmed` (or `failed` + refund path)

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| API crash on boot | Check logs for `JWT_SECRET`, `AUTO_SETTLE`, or `TELEGRAM_WEBHOOK_SECRET` errors |
| CORS errors in browser | Update `CORS_ORIGINS` on Railway; include exact scheme + host |
| Telegram webhook 403 | `TELEGRAM_WEBHOOK_SECRET` must match what was passed to `setWebhook` |
| Vercel build fails | Confirm Root Directory is `apps/web` or `apps/app`, not repo root |
| Prisma migrate fails | Postgres reachable; `DATABASE_URL` correct; check Railway logs |
| Marketing 500 locally | See [ops-and-debugging.md](./ops-and-debugging.md) port 3100 fix |

---

## Production checklist (after staging passes)

- [ ] Custom domains + HTTPS on all three surfaces
- [ ] `AUTO_SETTLE=false` confirmed
- [ ] No seed / demo account in deploy pipeline
- [ ] Strong `JWT_SECRET` rotated from staging
- [ ] Circle production keys (separate from sandbox)
- [ ] Legal pages live (`/terms`, privacy)
- [ ] httpOnly cookie auth (launch blocker — still open)

---

## Quick links

- [Launch blockers](./launch-blockers.md)
- [NEXT-MOVES master list](./NEXT-MOVES.md)
- [Local dev](./local-dev.md)

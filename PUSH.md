# Push & deploy VIRLUX

Repo: **https://github.com/kazemnezhadsina144-dot/VIRLUX**

Branch: `cursor/virlux-v2-platform-and-todolist` (pushed — open PR → `main`)

## 1. Merge PR

Open: https://github.com/kazemnezhadsina144-dot/VIRLUX/compare/main...cursor/virlux-v2-platform-and-todolist

Wait for **CI** and **Playwright E2E** workflows green, then merge.

## 2. Live demo stack (Sprint 1)

```bash
cd /Users/sinakazemnezhad/Desktop/Virlux
bash scripts/staging-prepare-env.sh   # creates .env.staging from template
# Edit .env.staging with secrets (JWT, Telegram, etc.)

RAILWAY_TOKEN=... VERCEL_TOKEN=... npm run staging:wire
npm run staging:vercel              # deploy virlux-web + virlux-app
```

**Vercel projects:**
- `virlux-web` — Root Directory `apps/web` (marketing)
- `virlux-app` — Root Directory `apps/app` (dashboard)

**Env on both Vercel projects:**
- `NEXT_PUBLIC_API_URL` — Railway API URL
- `NEXT_PUBLIC_APP_URL` — dashboard URL
- `NEXT_PUBLIC_WEB_URL` — marketing URL
- `NEXT_PUBLIC_BOOK_DEMO_URL` — Calendly/HubSpot link (optional)

**Railway API:** `SETTLEMENT_MODE=partner`, `AUTO_SETTLE=false`, `PLATFORM_ADMIN_EMAILS`, `CORS_ORIGINS`

**DNS:** `virlux.com` → marketing · `app.virlux.com` → dashboard

## 3. Verify live

```bash
npm run deploy:smoke
STAGING_API_URL=https://your-api.up.railway.app npm run staging:e2e
STAGING_APP_URL=https://app.virlux.com npm run staging:live-e2e
```

## 4. Founder GTM (Sprint 3)

Internal checklists (local `todolist/` — not in git):
- `accelerator-pitch-kit.md`
- `msb-partner-tracker.md`
- `pilot-outreach-pack.md`
- Send `counsel-review-brief.md` to counsel

## SSH deploy key (optional)

Add at https://github.com/kazemnezhadsina144-dot/VIRLUX/settings/keys:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAb23qg+D2netWi2ShE3d0GZjIS0QaFsCXfmvo3nw54f virlux-cursor-push
```

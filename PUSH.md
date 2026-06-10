# Push & deploy VIRLUX

Repo: **https://github.com/kazemnezhadsina144-dot/VIRLUX**  
Branch: **`main`** (production branch)

## 1. One-command deploy (founder tokens)

```bash
cd /Users/sinakazemnezhad/Desktop/Virlux
bash scripts/staging-prepare-env.sh   # first time — edit .env.staging secrets + DATABASE_URL

RAILWAY_TOKEN=... VERCEL_TOKEN=... npm run staging:deploy-all
```

Or step-by-step:

```bash
RAILWAY_TOKEN=... VERCEL_TOKEN=... npm run staging:wire
npm run staging:vercel
```

## 2. Vercel projects

| Project | Root Directory | Production URL |
|---------|----------------|----------------|
| `virlux-web` | repo root + `vercel.json` | https://virlux-web.vercel.app |
| `virlux-app` | `apps/app` | https://virlux-app.vercel.app |

Deploy from repo root (Vercel CLI session or `VERCEL_TOKEN`):

```bash
npm run staging:vercel-env   # sync NEXT_PUBLIC_* from .env.staging
npm run staging:vercel       # deploy web + app
```

**Env on both Vercel projects:**

- `NEXT_PUBLIC_API_URL` — Railway API URL
- `NEXT_PUBLIC_APP_URL` — dashboard URL
- `NEXT_PUBLIC_WEB_URL` — marketing URL
- `NEXT_PUBLIC_BOOK_DEMO_URL` — Calendly/HubSpot (GTM Phase 1)

**Railway API:**

- `SETTLEMENT_MODE=partner`, `AUTO_SETTLE=false`, `ALLOW_ORG_DEPOSIT_CONFIRM=false`
- `PLATFORM_ADMIN_EMAILS`, `CORS_ORIGINS` (both Vercel URLs)
- `DEPOSIT_WEBHOOK_SECRET`, `JWT_SECRET` (32+ chars)

**DNS:** `virlux.com` → marketing · `app.virlux.com` → dashboard

## 3. Verify live

```bash
export NEXT_PUBLIC_API_URL=https://your-api.up.railway.app
export STAGING_WEB_URL=https://virlux-web.vercel.app
export STAGING_APP_URL=https://virlux-app.vercel.app
npm run deploy:smoke
npm run staging:e2e
STAGING_APP_URL=$STAGING_APP_URL npm run staging:live-e2e
npm run staging:partner-e2e
```

## 4. Platform ops (pilot setup)

```bash
PLATFORM_ADMIN_EMAIL=demo@virlux.com npm run staging:platform-setup
```

Then use `/dashboard/platform` for Interac confirm + settlement queue.

## 5. Founder GTM

See [docs/FOUNDER-GTM-CHECKLIST.md](./docs/FOUNDER-GTM-CHECKLIST.md) and local `todolist/` (gitignored):

- `accelerator-pitch-kit.md`
- `pilot-outreach-pack.md`
- `counsel-review-brief.md`

Real money gates: [docs/REAL-MONEY-GATES.md](./docs/REAL-MONEY-GATES.md)

## SSH deploy key (optional)

Add at https://github.com/kazemnezhadsina144-dot/VIRLUX/settings/keys:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAb23qg+D2netWi2ShE3d0GZjIS0QaFsCXfmvo3nw54f virlux-cursor-push
```

# VIRLUX

Canadian B2B cross-border payments for SMEs — flat 1% fee, Interac on-ramp, team approvals, and partner settlement. Telegram: @VIRLUXBOT.

## Stack

| Service | Port | Deploy |
|---------|------|--------|
| Marketing `apps/web` | 3100 | Vercel |
| Dashboard `apps/app` | 3001 | Vercel |
| API `apps/api` | 3002 | Railway |
| PostgreSQL | 5432 | Railway / Docker |

Ports **3000, 8000, 8020** are not used.

## Quick start

```bash
cd /path/to/Virlux
unset DATABASE_URL          # shell override breaks Prisma — use .env instead
docker compose up -d postgres
cp .env.example .env        # add TELEGRAM_BOT_TOKEN, JWT_SECRET (32+ chars)
npm install
npm run db:migrate && npm run db:seed
npm run dev                 # web:3100, app:3001, api:3002
```

**Demo login (dev seed only):** `demo@virlux.com` / `demo12345`

If ports are stuck: `npm run dev` runs preflight and kills stale listeners on 3100/3001/3002.

## Tests

```bash
npm test                    # Vitest (API + shared)
npm run build               # All workspaces
npm run test:e2e            # Playwright (stack must be running, or use CI)
E2E_DEMO_LOGIN=1 npm run test:e2e
npm run staging:e2e         # API curl E2E (register → quote)
npm run staging:partner-e2e # Partner webhook signature gate
npm run staging:live-e2e    # Playwright on live STAGING_APP_URL (cookie auth)
npm run staging:platform-setup  # Create MSB partner + assign org (platform admin)
npm run staging:deploy-all      # Railway + Vercel + smoke (needs tokens)
bash scripts/ci-guards.sh   # Secret / MSB / todolist checks
```

Set `NEXT_PUBLIC_BOOK_DEMO_URL` on Vercel (Calendly/HubSpot) for marketing CTAs.

## Production defaults

- `SETTLEMENT_MODE=partner` — VIRLUX generates instructions; partners execute settlement
- `AUTO_SETTLE=false` — required in production
- `ALLOW_ORG_DEPOSIT_CONFIRM=false` — deposit confirmation via partner/platform ops
- `fintracMsbClaim: false` in `@virlux/shared` until MSB registration is verified

See `.env.example` and `.env.staging.example` for full variable lists.

## Deploy

```bash
npm run deploy:checklist
npm run deploy:push-setup   # GitHub auth + push (see PUSH.md)
```

Staging: `RAILWAY_TOKEN=... VERCEL_TOKEN=... npm run staging:deploy-all`

Or step-by-step: `npm run staging:wire` then `npm run staging:vercel`

- **Railway:** API + Postgres (`railway.toml`) — `SETTLEMENT_MODE=partner`, `AUTO_SETTLE=false`
- **Vercel:** two projects — Root Directory `apps/web` (`virlux-web`) and `apps/app` (`virlux-app`)
- Set `NEXT_PUBLIC_API_URL` to Railway API URL on both Vercel projects
- Set `NEXT_PUBLIC_BOOK_DEMO_URL` for Calendly CTA on marketing

See [PUSH.md](./PUSH.md), [docs/FOUNDER-GTM-CHECKLIST.md](./docs/FOUNDER-GTM-CHECKLIST.md), [docs/REAL-MONEY-GATES.md](./docs/REAL-MONEY-GATES.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Telegram

Official bot: **@VIRLUXBOT** only.

- Local: `TELEGRAM_MODE=polling`
- Prod: `TELEGRAM_MODE=webhook`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_WEBHOOK_URL`

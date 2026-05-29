# VIRLUX

Cross-border B2B payments for Canadian SMEs — stablecoin settlement, Interac on-ramp, team approvals, Circle sandbox, Telegram @VIRLUXBOT.

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
docker compose up -d postgres
cp .env.example .env   # add TELEGRAM_BOT_TOKEN, secrets
npm install
npm run db:push && npm run db:seed
npm run dev
```

Demo: `demo@virlux.com` / `demo12345`

## Future tracking

Founder/product follow-ups (launch blockers, UI roadmap, ops runbooks) live in **[`todolist/`](./todolist/README.md)** — update after each build session.

## Phase features (v2.1)

- **PostgreSQL** + Docker Compose (SQLite removed)
- **Telegram** polling (local) or webhook (production) — @VIRLUXBOT, token-based linking
- **Circle** USDC transfer skeleton (`CIRCLE_API_KEY`, `CIRCLE_WALLET_ID`, sandbox)
- **Team** invites + role management (`/dashboard/team`)
- **Tests** — Vitest (fees, auth, ledger, send) + GitHub Actions CI
- **Deploy** — `vercel.json`, `railway.toml`, `scripts/deploy.sh`

## Fintech safeguards (v2.2)

- Atomic quote consume + debit + transaction create (no double-spend)
- Ledger idempotency + conditional balance updates (no overdraft races)
- External remittance does **not** credit sender USDC; Circle failure refunds fiat
- `AUTO_SETTLE` dev-only (explicit opt-in); blocked in production
- Maker-checker approvals, org-scoped audit, role-gated send/deposit
- Marketing claims aligned with actual product scope

## Env vars

See `.env.example` for full list. Key production vars:

- `DATABASE_URL` — PostgreSQL
- `JWT_SECRET` — long random string
- `TELEGRAM_MODE=webhook` + `TELEGRAM_WEBHOOK_URL` on Railway
- `CIRCLE_API_KEY` + `CIRCLE_WALLET_ID` for real USDC (sandbox first)
- `AUTO_SETTLE=true` — **local dev only** (simulates deposits/settlement/KYC)
- `AUTO_SETTLE=false` in production (required)

## Telegram

Official bot: **@VIRLUXBOT** only. TrustField / Virelux bots are separate.

- Local: `TELEGRAM_MODE=polling`
- Prod: `TELEGRAM_MODE=webhook`, `TELEGRAM_WEBHOOK_URL=https://api.example.com/api/telegram/webhook`

## Deploy

```bash
npm run deploy:checklist          # print Railway + Vercel steps
npm run deploy:secrets            # generate JWT + webhook secrets
npm run deploy:smoke              # after deploy (set NEXT_PUBLIC_API_URL)
```

Full runbook: **[`todolist/staging-deploy.md`](./todolist/staging-deploy.md)**

- **Railway:** API + Postgres, use `railway.toml`
- **Vercel:** two projects — Root Directory `apps/web` and `apps/app`
- Set `NEXT_PUBLIC_API_URL` to Railway API URL on both Vercel projects
- Copy env from `.env.staging.example`

## Tests

```bash
npm test
```

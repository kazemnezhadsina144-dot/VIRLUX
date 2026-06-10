# Contributing to VIRLUX

## Prerequisites

- Node.js 22+
- Docker (for local Postgres)
- npm workspaces at repo root

## Setup

```bash
unset DATABASE_URL
docker compose up -d postgres
cp .env.example .env
npm install
npm run db:migrate && npm run db:seed
npm run dev
```

Services: marketing **3100**, dashboard **3001**, API **3002**. Do not use ports 3000, 8000, or 8020.

## Before opening a PR

```bash
npm test
npm run build
bash scripts/ci-guards.sh
E2E_DEMO_LOGIN=1 npm run test:e2e   # optional locally; required in CI
```

## Rules

- **Never commit** `todolist/` — internal ops docs only (gitignored)
- **Never commit** `.env`, `.env.local`, or secrets
- Public copy must follow `packages/shared/src/public-copy.ts` — no stablecoin/rails jargon in SME UI
- Do not set `fintracMsbClaim: true` without verified MSB registration and counsel approval
- Do not reference competitor names in shipped code or marketing
- Cross-brand or sibling-repo code is out of scope unless explicitly requested

## Architecture notes

Production uses `SETTLEMENT_MODE=partner`. Circle sandbox is dev/staging tooling only — blocked in production partner mode.

Demo account (`demo@virlux.com`) is for local seed only — never enable `SEED_DATABASE` in production.

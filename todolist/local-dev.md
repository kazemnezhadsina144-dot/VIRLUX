# Local dev runbook

Project root: `/Users/sinakazemnezhad/Desktop/Virlux`

## Ports

| Service | URL | Notes |
|---------|-----|-------|
| Marketing | http://localhost:3100 | `apps/web` |
| Dashboard | http://localhost:3001 | `apps/app` |
| API | http://localhost:3002 | `apps/api` |
| Postgres | localhost:5432 | Docker Compose |

**Do not use:** 3000, 8000, 8020 (other apps).

---

## First-time / clean setup

```bash
cd /Users/sinakazemnezhad/Desktop/Virlux
export PATH="$PWD/.tools/node/bin:$PATH"

# Shell may override .env with old SQLite URL — clear it:
unset DATABASE_URL

docker compose up -d postgres
npm install
npm run db:migrate && npm run db:seed
npm run dev
```

---

## Demo credentials (dev seed only)

- **Email:** `demo@virlux.com`
- **Password:** `demo12345`
- Seed skipped in production unless `SEED_DATABASE=true`.

---

## Env highlights

| Variable | Local dev | Production |
|----------|-----------|------------|
| `DATABASE_URL` | `postgresql://virlux:virlux@localhost:5432/virlux` | Railway Postgres URL |
| `AUTO_SETTLE` | `true` (explicit + dev only) | **`false`** |
| `JWT_SECRET` | 32+ chars in `.env` | Strong random, no fallback |
| `TELEGRAM_MODE` | `polling` | `webhook` + secret |

---

## Tests

```bash
npm test          # API + shared (10 tests as of 2026-05-29)
npm run build     # All workspaces
```

---

## TrustField boundary

**Do not modify** `TrustField Technologies` or its Telegram bot unless explicitly requested. VIRLUX bot: **@VIRLUXBOT** in this repo only.

#!/usr/bin/env bash
# Local production-mode staging verification (Postgres + API + smoke/e2e)
# Use when Railway/Vercel tokens are not yet available.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== Start Postgres =="
docker compose up -d postgres
sleep 3

echo "== Migrate =="
npm run db:migrate

echo "== Build =="
npm run build

JWT=$(openssl rand -hex 32)
WEBHOOK=$(openssl rand -hex 16)
TELEGRAM=$(grep '^TELEGRAM_BOT_TOKEN=' "$ROOT/.env" | cut -d= -f2- || true)

export NODE_ENV=production
export PORT=3002
export DATABASE_URL="${DATABASE_URL:-postgresql://virlux:virlux@localhost:5432/virlux}"
export JWT_SECRET="$JWT"
export AUTO_SETTLE=false
export TELEGRAM_MODE=webhook
export TELEGRAM_BOT_TOKEN="$TELEGRAM"
export TELEGRAM_WEBHOOK_SECRET="$WEBHOOK"
export TELEGRAM_WEBHOOK_URL=http://localhost:3002/api/telegram/webhook
export CORS_ORIGINS=http://localhost:3100,http://localhost:3001
export NEXT_PUBLIC_API_URL=http://localhost:3002
export NEXT_PUBLIC_WEB_URL=http://localhost:3100
export NEXT_PUBLIC_APP_URL=http://localhost:3001

echo "== Start API (production) =="
npm run start -w @virlux/api &
API_PID=$!
sleep 4

cleanup() {
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "== Smoke =="
export STAGING_WEB_URL=http://localhost:3100
export STAGING_APP_URL=http://localhost:3001
npm run deploy:smoke

echo "== API E2E =="
npm run staging:e2e

echo ""
echo "Local production-mode verification passed."
echo "For cloud staging: RAILWAY_TOKEN=... VERCEL_TOKEN=... bash scripts/staging-railway-deploy.sh"

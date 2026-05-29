#!/usr/bin/env bash
# Production deploy helper — Railway (API) + Vercel (web/app)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== VIRLUX deploy checklist =="
echo "1. Railway: connect repo, set root, use apps/api/Dockerfile or railway.toml"
echo "2. Railway env: DATABASE_URL, JWT_SECRET, TELEGRAM_BOT_TOKEN, TELEGRAM_MODE=webhook"
echo "3. Railway env: TELEGRAM_WEBHOOK_URL=https://YOUR-API.railway.app/api/telegram/webhook"
echo "4. Circle (optional): CIRCLE_API_KEY, CIRCLE_WALLET_ID, CIRCLE_SANDBOX=true"
echo "5. Vercel: deploy apps/web (port 3100) and apps/app (port 3001) as separate projects"
echo "6. Vercel env: NEXT_PUBLIC_API_URL=https://YOUR-API.railway.app"
echo ""
echo "Local postgres:"
echo "  docker compose up -d postgres"
echo "  cd apps/api && npx prisma db push && npx tsx prisma/seed.ts"

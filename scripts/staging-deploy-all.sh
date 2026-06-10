#!/usr/bin/env bash
# Full staging deploy: Railway → Vercel → smoke → E2E
# Requires: RAILWAY_TOKEN, VERCEL_TOKEN, .env.staging
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.env.staging" ]]; then
  echo "Run: npm run staging:prepare"
  echo "Then edit .env.staging with DATABASE_URL and URLs"
  exit 1
fi

if [[ -z "${RAILWAY_TOKEN:-}" || -z "${VERCEL_TOKEN:-}" ]]; then
  if npx vercel whoami >/dev/null 2>&1; then
    echo "Vercel CLI session detected — proceeding without VERCEL_TOKEN"
  else
    echo "Set RAILWAY_TOKEN and VERCEL_TOKEN (or log in: npx vercel login)"
    echo ""
    echo "  RAILWAY_TOKEN=... VERCEL_TOKEN=... npm run staging:deploy-all"
    echo ""
    echo "Or wire an existing API URL:"
    echo "  bash scripts/staging-wire-production.sh https://YOUR-API.up.railway.app"
    exit 1
  fi
fi

echo "== Phase 1: Railway + Vercel wire =="
npm run staging:wire

echo ""
echo "== Phase 1: Vercel production deploy =="
npm run staging:vercel

echo ""
echo "== DNS checklist (founder) =="
echo "  virlux.com      → virlux-web Vercel project"
echo "  app.virlux.com  → virlux-app Vercel project"
echo "  Set NEXT_PUBLIC_BOOK_DEMO_URL on virlux-web (Calendly)"
echo ""
echo "== Phase 2: Live cookie E2E =="
echo "  STAGING_APP_URL=\${NEXT_PUBLIC_APP_URL} npm run staging:live-e2e"
echo ""
echo "== Phase 3: Platform ops setup =="
echo "  PLATFORM_ADMIN_EMAIL=... npm run staging:platform-setup"

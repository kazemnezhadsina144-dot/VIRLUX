#!/usr/bin/env bash
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-20260605 | session=d09ef6b2 | date=2026-06-05
# No-ASF verify ladder — smoke + full Playwright on live Vercel URLs
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://virlux-api.vercel.app}"
export STAGING_WEB_URL="${STAGING_WEB_URL:-https://virlux-web.vercel.app}"
export STAGING_APP_URL="${STAGING_APP_URL:-https://virlux-app.vercel.app}"
export PLAYWRIGHT_WEB_URL="${PLAYWRIGHT_WEB_URL:-$STAGING_WEB_URL}"
export PLAYWRIGHT_APP_URL="${PLAYWRIGHT_APP_URL:-$STAGING_APP_URL}"
export E2E_DEMO_LOGIN=1

echo "== verify:live =="
npm test -w @virlux/shared
npm run ci:guards
npm run build -w @virlux/shared
npm run build -w @virlux/web
npm run build -w @virlux/app
npm run deploy:smoke
npm run verify:book-demo
echo "Note: smoke:custom-domains may fail while virlux.com serves /lander (expected — use virlux-web.vercel.app for E2E)"
npx playwright test
echo "== verify:live OK =="

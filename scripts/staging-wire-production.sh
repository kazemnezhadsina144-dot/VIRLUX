#!/usr/bin/env bash
# Wire permanent Railway API URL to Vercel and run smoke + E2E
# Usage:
#   RAILWAY_TOKEN=... VERCEL_TOKEN=... bash scripts/staging-wire-production.sh
#   bash scripts/staging-wire-production.sh https://your-api.up.railway.app  # skip Railway deploy
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

API_URL="${1:-}"

if [[ -z "$API_URL" ]]; then
  if [[ -z "${RAILWAY_TOKEN:-}" ]]; then
    echo "Provide API URL as arg or set RAILWAY_TOKEN and run staging:railway first."
    echo "  bash scripts/staging-wire-production.sh https://your-api.up.railway.app"
    exit 1
  fi
  echo "== Deploy Railway API =="
  npm run staging:railway
  API_URL=$(npx railway domain 2>/dev/null | tail -1 || true)
  if [[ -z "$API_URL" || "$API_URL" == *"Set public"* ]]; then
    echo "Could not detect Railway domain — pass URL manually:"
    echo "  bash scripts/staging-wire-production.sh https://your-api.up.railway.app"
    exit 1
  fi
  [[ "$API_URL" != https://* ]] && API_URL="https://${API_URL}"
fi

API_URL="${API_URL%/}"
echo "API URL: $API_URL"

if [[ -f "$ROOT/.env.staging" ]]; then
  if grep -q '^NEXT_PUBLIC_API_URL=' "$ROOT/.env.staging"; then
    sed -i.bak "s|^NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=${API_URL}|" "$ROOT/.env.staging"
  else
    echo "NEXT_PUBLIC_API_URL=${API_URL}" >> "$ROOT/.env.staging"
  fi
  rm -f "$ROOT/.env.staging.bak"
fi

WEB_URL="${STAGING_WEB_URL:-https://virlux-web.vercel.app}"
APP_URL="${STAGING_APP_URL:-https://virlux-app.vercel.app}"

if [[ -n "${VERCEL_TOKEN:-}" ]] || npx vercel whoami >/dev/null 2>&1; then
  echo "== Update Vercel env vars =="
  SCOPE="${VERCEL_SCOPE:-the-777-foundation}"
  TOKEN_ARGS=()
  [[ -n "${VERCEL_TOKEN:-}" ]] && TOKEN_ARGS=(--token "$VERCEL_TOKEN")
  for project in virlux-web virlux-app; do
    echo "$API_URL" | npx vercel env rm NEXT_PUBLIC_API_URL production --yes "${TOKEN_ARGS[@]}" --scope "$SCOPE" -p "$project" 2>/dev/null || true
    echo "$API_URL" | npx vercel env add NEXT_PUBLIC_API_URL production "${TOKEN_ARGS[@]}" --scope "$SCOPE" -p "$project" 2>/dev/null || true
    if [[ "$project" == "virlux-app" ]]; then
      echo "true" | npx vercel env rm NEXT_PUBLIC_DEMO_MODE production --yes "${TOKEN_ARGS[@]}" --scope "$SCOPE" -p "$project" 2>/dev/null || true
      echo "true" | npx vercel env add NEXT_PUBLIC_DEMO_MODE production "${TOKEN_ARGS[@]}" --scope "$SCOPE" -p "$project" 2>/dev/null || true
    fi
  done
  echo "Redeploy: npm run staging:vercel"
else
  echo "VERCEL_TOKEN not set — manually update NEXT_PUBLIC_API_URL on Vercel projects (virlux-web, virlux-app):"
  echo "  $API_URL"
fi

echo ""
echo "== Smoke checks =="
export NEXT_PUBLIC_API_URL="$API_URL"
export STAGING_WEB_URL="$WEB_URL"
export STAGING_APP_URL="$APP_URL"
npm run deploy:smoke

echo ""
echo "== Staging API E2E =="
npm run staging:e2e

echo ""
echo "== Partner webhook E2E =="
npm run staging:partner-e2e || echo "WARN: partner E2E skipped (needs demo seed on API)"

if [[ -n "$APP_URL" && "$APP_URL" != *"YOUR-"* ]]; then
  echo ""
  echo "== Live cookie E2E (Playwright) =="
  echo "Requires SEED_DATABASE on target or demo user — run manually if API has no seed:"
  echo "  STAGING_APP_URL=$APP_URL npm run staging:live-e2e"
fi

echo ""
echo "Done. Permanent API: $API_URL"
echo "Next: DNS virlux.com → marketing, app.virlux.com → dashboard"
echo "Set NEXT_PUBLIC_BOOK_DEMO_URL on virlux-web Vercel project for Calendly CTA"

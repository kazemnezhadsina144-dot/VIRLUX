#!/usr/bin/env bash
# Deploy VIRLUX web + app to Vercel (requires VERCEL_TOKEN)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "Set VERCEL_TOKEN (https://vercel.com/account/tokens)"
  exit 1
fi

export VERCEL_TOKEN
VERCEL="npx vercel"

if [[ ! -f "$ROOT/.env.staging" ]]; then
  echo "Missing .env.staging — run: bash scripts/staging-prepare-env.sh"
  exit 1
fi

# shellcheck disable=SC2046
export $(grep -v '^#' "$ROOT/.env.staging" | grep '^NEXT_PUBLIC_' | xargs)

echo "== Vercel: deploy marketing (apps/web) =="
WEB_URL=$($VERCEL deploy --yes --token "$VERCEL_TOKEN" --cwd "$ROOT/apps/web" --prod 2>&1 | tail -1)
echo "Marketing: $WEB_URL"

echo "== Vercel: deploy dashboard (apps/app) =="
APP_URL=$($VERCEL deploy --yes --token "$VERCEL_TOKEN" --cwd "$ROOT/apps/app" --prod 2>&1 | tail -1)
echo "Dashboard: $APP_URL"

echo ""
echo "Update Railway CORS_ORIGINS with:"
echo "  $WEB_URL,$APP_URL"
echo ""
echo "Update .env.staging NEXT_PUBLIC_WEB_URL and NEXT_PUBLIC_APP_URL, then redeploy API if needed."

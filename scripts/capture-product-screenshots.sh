#!/usr/bin/env bash
# Capture homepage product PNGs from live or local app (founder GTM media)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f .env.staging ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.staging 2>/dev/null || true
  set +a
fi

export PLAYWRIGHT_APP_URL="${PLAYWRIGHT_APP_URL:-${STAGING_APP_URL:-${NEXT_PUBLIC_APP_URL:-http://localhost:3001}}}"
export E2E_DEMO_LOGIN=1

echo "Capturing screenshots from $PLAYWRIGHT_APP_URL ..."
npx playwright test e2e/capture-screenshots.spec.ts --project=capture-screenshots

echo ""
echo "Saved to apps/web/public/screenshots/*.png"
echo "Commit PNGs and redeploy virlux-web — see docs/GTM-MEDIA-CHECKLIST.md"

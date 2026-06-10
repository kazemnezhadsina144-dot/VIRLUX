#!/usr/bin/env bash
# Post-deploy verification — smoke + optional live E2E
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== Post-deploy verify =="

# Load staging URLs if present
if [[ -f .env.staging ]]; then
  set -a
  # shellcheck disable=SC1091
  . .env.staging 2>/dev/null || true
  set +a
fi

export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://virlux-api.vercel.app}"
export STAGING_APP_URL="${STAGING_APP_URL:-${NEXT_PUBLIC_APP_URL:-https://virlux-app.vercel.app}}"
export STAGING_WEB_URL="${STAGING_WEB_URL:-${NEXT_PUBLIC_WEB_URL:-https://virlux-web.vercel.app}}"
export PLAYWRIGHT_APP_URL="${PLAYWRIGHT_APP_URL:-$STAGING_APP_URL}"
export PLAYWRIGHT_WEB_URL="${PLAYWRIGHT_WEB_URL:-$STAGING_WEB_URL}"
export E2E_DEMO_LOGIN=1

echo "Running deploy:smoke..."
npm run deploy:smoke

bash "$ROOT/scripts/verify-analytics.sh" || true

echo ""
echo "Running full Playwright against $PLAYWRIGHT_APP_URL ..."
npx playwright test

echo ""
echo "Manual checklist:"
echo "  - Login at app URL"
echo "  - Send \$500 PH → payments list"
echo "  - Send \$150 → approver queue → approve"
echo "  - See docs/GTM-MEDIA-CHECKLIST.md for Loom/Calendly/PNGs"

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
  source .env.staging 2>/dev/null || true
  set +a
fi

export STAGING_APP_URL="${STAGING_APP_URL:-${NEXT_PUBLIC_APP_URL:-}}"
export STAGING_WEB_URL="${STAGING_WEB_URL:-${NEXT_PUBLIC_WEB_URL:-}}"

echo "Running deploy:smoke..."
npm run deploy:smoke

if [[ -n "${STAGING_APP_URL:-}" ]]; then
  echo ""
  echo "Running staging:live-e2e against $STAGING_APP_URL ..."
  npm run staging:live-e2e
else
  echo ""
  echo "Skip live E2E — set STAGING_APP_URL or NEXT_PUBLIC_APP_URL"
fi

echo ""
echo "Manual checklist:"
echo "  - Login at app URL"
echo "  - Send \$500 PH → payments list"
echo "  - Send \$150 → approver queue → approve"
echo "  - See docs/GTM-MEDIA-CHECKLIST.md for Loom/Calendly/PNGs"

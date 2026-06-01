#!/usr/bin/env bash
# Live/staging Playwright smoke — dashboard login via cookie proxy (requires demo seed on target API)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

APP="${STAGING_APP_URL:-${NEXT_PUBLIC_APP_URL:-}}"
WEB="${STAGING_WEB_URL:-${NEXT_PUBLIC_WEB_URL:-}}"

if [[ -z "$APP" ]]; then
  echo "Set STAGING_APP_URL or NEXT_PUBLIC_APP_URL (dashboard base URL)"
  exit 1
fi

export PATH="$ROOT/.tools/node/bin:${PATH:-}"
export PLAYWRIGHT_APP_URL="${APP%/}"
export PLAYWRIGHT_WEB_URL="${WEB:-$APP}"
export E2E_DEMO_LOGIN=1

echo "== Live cookie E2E =="
echo "App: $PLAYWRIGHT_APP_URL"
echo "Web: $PLAYWRIGHT_WEB_URL"
echo ""

npx playwright test \
  e2e/marketing-mobile-nav.spec.ts \
  e2e/dashboard.spec.ts \
  e2e/send-flow.spec.ts \
  e2e/approval-flow.spec.ts \
  --project=marketing-mobile \
  --project=dashboard \
  --project=send-flow \
  --project=approval-flow

#!/usr/bin/env bash
# Post-deploy smoke checks for staging
set -euo pipefail

API="${NEXT_PUBLIC_API_URL:-}"
WEB="${STAGING_WEB_URL:-${NEXT_PUBLIC_WEB_URL:-}}"
APP="${STAGING_APP_URL:-${NEXT_PUBLIC_APP_URL:-}}"

if [[ -z "$API" ]]; then
  echo "Set NEXT_PUBLIC_API_URL (Railway API base URL, no trailing slash)"
  exit 1
fi

echo "== VIRLUX staging smoke =="
echo "API: $API"
echo ""

check() {
  local name="$1"
  local url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url" || echo "000")
  if [[ "$code" =~ ^2 ]]; then
    echo "OK  $name ($code) $url"
  else
    echo "FAIL $name ($code) $url"
    return 1
  fi
}

fail=0
check "API health" "$API/health" || fail=1
check "API meta" "$API/api/meta/config" || fail=1
check "Telegram status" "$API/api/telegram/status" || fail=1

if [[ -n "$WEB" ]]; then
  check "Marketing" "$WEB/" || fail=1
fi
if [[ -n "$APP" ]]; then
  check "Dashboard" "$APP/" || fail=1
fi

echo ""
if [[ "$fail" -eq 0 ]]; then
  echo "All smoke checks passed."
else
  echo "Some checks failed — see staging-deploy.md troubleshooting."
  exit 1
fi

#!/usr/bin/env bash
# Fail fast when staging env still has placeholder URLs
set -euo pipefail

fail=0

check() {
  local name="$1"
  local val="${2:-}"
  if [[ -z "$val" ]]; then
    echo "MISSING $name"
    fail=1
    return
  fi
  if [[ "$val" == *"YOUR-"* ]] || [[ "$val" == *"REPLACE"* ]]; then
    echo "PLACEHOLDER $name=$val"
    fail=1
    return
  fi
  echo "OK $name"
}

echo "== Validate staging env =="
check "NEXT_PUBLIC_API_URL" "${NEXT_PUBLIC_API_URL:-}"
check "NEXT_PUBLIC_APP_URL" "${NEXT_PUBLIC_APP_URL:-${STAGING_APP_URL:-}}"
check "NEXT_PUBLIC_WEB_URL" "${NEXT_PUBLIC_WEB_URL:-${STAGING_WEB_URL:-}}"

if [[ "$fail" -ne 0 ]]; then
  echo ""
  echo "Fix .env.staging or export real URLs before deploy."
  exit 1
fi

echo "All staging URLs look valid."

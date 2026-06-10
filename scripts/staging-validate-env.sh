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

echo ""
echo "== Security env checks =="
SEC_FAIL=0

if [[ "${NODE_ENV:-}" == "production" ]]; then
  for bad in ALLOW_OPEN_REGISTRATION AUTO_SETTLE; do
    val="${!bad:-}"
    if [[ "$val" == "true" ]]; then
      echo "FORBIDDEN $bad=true with NODE_ENV=production"
      SEC_FAIL=1
    fi
  done
  if [[ "${DEMO_FUND_ENABLED:-}" == "true" ]]; then
    echo "FORBIDDEN DEMO_FUND_ENABLED=true with NODE_ENV=production"
    SEC_FAIL=1
  fi
fi

if [[ -n "${JWT_SECRET:-}" && ${#JWT_SECRET} -lt 32 ]]; then
  echo "WEAK JWT_SECRET (min 32 chars)"
  SEC_FAIL=1
fi

if [[ "$SEC_FAIL" -ne 0 ]]; then
  echo ""
  echo "Fix .env.staging security flags before deploy."
  exit 1
fi

echo "Security env checks passed."

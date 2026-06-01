#!/usr/bin/env bash
# Verify Circle sandbox config on running API
set -euo pipefail

API="${STAGING_API_URL:-${NEXT_PUBLIC_API_URL:-http://localhost:3002}}"
API="${API%/}"

echo "== VIRLUX Circle sandbox check =="
echo "API: $API"

HEALTH=$(curl -fsS "$API/health")
echo "$HEALTH" | jq .

CONFIGURED=$(echo "$HEALTH" | jq -r '.circle.configured // false')
REACHABLE=$(echo "$HEALTH" | jq -r '.circle.reachable // false')

if [[ "$CONFIGURED" != "true" ]]; then
  echo "WARN: Circle not configured — set CIRCLE_API_KEY + CIRCLE_WALLET_ID on API"
  echo "Then run a manual send E2E on staging (KYC approved, funded, external USDC wallet)."
  exit 0
fi

if [[ "$REACHABLE" != "true" ]]; then
  echo "FAIL: Circle configured but not reachable"
  exit 1
fi

echo "Circle sandbox reachable. Run manual send E2E on staging dashboard."

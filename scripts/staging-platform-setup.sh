#!/usr/bin/env bash
# Create MSB partner + assign to org via platform API (requires platform admin login)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=/dev/null
source "$ROOT/scripts/load-tier3-secrets.sh"

API="${STAGING_API_URL:-${NEXT_PUBLIC_API_URL:-http://localhost:3002}}"
API="${API%/}"
EMAIL="${PLATFORM_ADMIN_EMAIL:-demo@virlux.com}"
PASS="${PLATFORM_ADMIN_PASSWORD:-${DEMO_SEED_PASSWORD:-${E2E_DEMO_PASSWORD:-}}}"
if [[ -z "$PASS" ]]; then
  echo "Set PLATFORM_ADMIN_PASSWORD or DEMO_SEED_PASSWORD (min 12 chars)"
  exit 1
fi
PARTNER_NAME="${PARTNER_NAME:-Pilot MSB Partner Ltd}"
WEBHOOK_SECRET="${PARTNER_WEBHOOK_SECRET:-$(openssl rand -hex 16)}"
ORG_ID="${ORG_ID:-}"
PILOT_CORRIDOR="${PILOT_CORRIDOR:-PH}"

echo "== VIRLUX platform setup =="
echo "API: $API"

JAR=$(mktemp)
trap 'rm -f "$JAR"' EXIT
bash "$ROOT/scripts/curl-api-login.sh" "$API" "$EMAIL" "$PASS" "$JAR"
AUTH=(-b "$JAR" -c "$JAR" -H "Content-Type: application/json")

echo "1. Create partner: $PARTNER_NAME"
PARTNER=$(curl -sS -X POST "$API/api/platform/partners" \
  "${AUTH[@]}" \
  -d "{\"legalName\":\"$PARTNER_NAME\",\"webhookSecret\":\"$WEBHOOK_SECRET\"}")
PARTNER_ID=$(echo "$PARTNER" | jq -r '.id // empty')
if [[ -z "$PARTNER_ID" ]]; then
  echo "Partner create failed: $PARTNER"
  exit 1
fi
echo "   Partner ID: $PARTNER_ID"

if [[ -z "$ORG_ID" ]]; then
  ORG_ID=$(curl -sS "$API/api/auth/me" "${AUTH[@]}" | jq -r '.organizationId // empty')
fi

if [[ -n "$ORG_ID" && "$ORG_ID" != "null" ]]; then
  echo "2. Assign partner to org: $ORG_ID"
  curl -sS -X PATCH "$API/api/platform/organizations/$ORG_ID/partner" \
    "${AUTH[@]}" \
    -d "{\"partnerId\":\"$PARTNER_ID\"}" | jq -e '.id' >/dev/null

  echo "3. Set pilot corridor: $PILOT_CORRIDOR"
  curl -sS -X PATCH "$API/api/platform/organizations/$ORG_ID/pilot-corridor" \
    "${AUTH[@]}" \
    -d "{\"pilotCorridor\":\"$PILOT_CORRIDOR\"}" | jq -e '.id' >/dev/null
else
  echo "2. Skip org assign — set ORG_ID or login as org user"
fi

echo ""
echo "Platform setup complete."
echo "  Partner ID: $PARTNER_ID"
echo "  Webhook secret: $WEBHOOK_SECRET (store securely — shown once)"
echo "Next: npm run staging:partner-e2e"

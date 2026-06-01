#!/usr/bin/env bash
# Create MSB partner + assign to org via platform API (requires platform admin login)
# Usage:
#   STAGING_API_URL=https://api.example.com \
#   PLATFORM_ADMIN_EMAIL=demo@virlux.com PLATFORM_ADMIN_PASSWORD=demo12345 \
#   ORG_ID=seed-org-demo PARTNER_NAME="Pilot MSB Ltd" \
#   bash scripts/staging-platform-setup.sh
set -euo pipefail

API="${STAGING_API_URL:-${NEXT_PUBLIC_API_URL:-http://localhost:3002}}"
API="${API%/}"
EMAIL="${PLATFORM_ADMIN_EMAIL:-demo@virlux.com}"
PASS="${PLATFORM_ADMIN_PASSWORD:-demo12345}"
PARTNER_NAME="${PARTNER_NAME:-Pilot MSB Partner Ltd}"
WEBHOOK_SECRET="${PARTNER_WEBHOOK_SECRET:-$(openssl rand -hex 16)}"
ORG_ID="${ORG_ID:-}"
PILOT_CORRIDOR="${PILOT_CORRIDOR:-PH}"

echo "== VIRLUX platform setup =="
echo "API: $API"

LOGIN=$(curl -sS -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN" | jq -r '.accessToken // empty')
if [[ -z "$TOKEN" ]]; then
  echo "Platform admin login failed. Set PLATFORM_ADMIN_EMAIL in PLATFORM_ADMIN_EMAILS on Railway."
  echo "$LOGIN"
  exit 1
fi

AUTH=(-H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")

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

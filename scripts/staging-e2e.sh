#!/usr/bin/env bash
# Local/staging API E2E — register, quote (no Circle required)
set -euo pipefail

API="${STAGING_API_URL:-${NEXT_PUBLIC_API_URL:-http://localhost:3002}}"
API="${API%/}"

echo "== VIRLUX staging API E2E =="
echo "API: $API"

EMAIL="e2e-$(date +%s)@virlux.test"
PASS="TestPass123!"

echo "1. Register..."
REG=$(curl -sS -X POST "$API/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"fullName\":\"E2E User\",\"companyName\":\"E2E Inc\"}")
if ! echo "$REG" | jq -e '.accessToken' >/dev/null 2>&1; then
  echo "Register failed: $REG"
  exit 1
fi
TOKEN=$(echo "$REG" | jq -r '.accessToken')

echo "2. Me..."
curl -fsS "$API/api/auth/me" -H "Authorization: Bearer $TOKEN" | jq -e '.email == "'"$EMAIL"'"' >/dev/null

echo "3. KYC submit..."
curl -fsS -X POST "$API/api/kyc/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentType":"passport","documentNumber":"E2E123456"}' | jq -e '.id' >/dev/null

echo "4. Public quote..."
curl -fsS "$API/api/quote/estimate?amountCad=1000&toCountry=US" | jq -e '.amountOut' >/dev/null

echo ""
echo "Staging API E2E passed (register → me → kyc → quote)."

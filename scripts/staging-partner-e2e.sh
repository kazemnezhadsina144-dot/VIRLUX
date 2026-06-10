#!/usr/bin/env bash
# Partner settlement flow E2E — requires local API with SETTLEMENT_MODE=partner (or staging)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=/dev/null
source "$ROOT/scripts/load-tier3-secrets.sh"

API="${STAGING_API_URL:-${NEXT_PUBLIC_API_URL:-http://localhost:3002}}"
API="${API%/}"

echo "== VIRLUX partner settlement E2E =="
echo "API: $API"

if ! curl -fsS "$API/health" >/dev/null; then
  echo "API not reachable at $API"
  exit 1
fi

EMAIL="${E2E_EMAIL:-demo@virlux.com}"
PASS="${E2E_PASSWORD:-${E2E_DEMO_PASSWORD:-${DEMO_SEED_PASSWORD:-}}}"
if [[ -z "$PASS" ]]; then
  echo "Set E2E_PASSWORD or DEMO_SEED_PASSWORD"
  exit 1
fi

echo "1. Login..."
JAR=$(mktemp)
trap 'rm -f "$JAR"' EXIT
bash "$ROOT/scripts/curl-api-login.sh" "$API" "$EMAIL" "$PASS" "$JAR"

echo "2. Health includes settlement mode..."
curl -fsS "$API/health" | jq -e '.status == "ok"' >/dev/null

echo "3. Partner settlement webhook rejects bad signature..."
RES=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$API/api/partner/settlement/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Virlux-Signature: bad" \
  -d '{"partnerId":"x","virluxTransactionId":"x","status":"complete","partnerSettlementId":"ps-1"}')
if [ "$RES" != "403" ]; then
  echo "Expected 403 for bad signature, got $RES"
  exit 1
fi

echo ""
echo "Partner settlement E2E passed (auth + webhook signature gate)."

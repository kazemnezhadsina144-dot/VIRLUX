#!/usr/bin/env bash
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-20260606 | session=d09ef6b2 | date=2026-06-06
# Full verify ladder + analytics (skip) + custom DNS smoke (lander fail = warn)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== verify:full =="
npm run verify:live
npm run verify:supabase-security
npm run verify:security-headers
npm run verify:analytics

echo ""
echo "-- custom domain smoke (founder DNS) --"
if npm run smoke:custom-domains; then
  echo "OK  custom domains"
else
  echo "WARN custom domains — expected until virlux.com → virlux-web (not /lander)"
fi

echo "== verify:full OK =="

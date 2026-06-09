#!/usr/bin/env bash
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-20260605 | session=d09ef6b2 | date=2026-06-05
# Check Plausible script on live web when NEXT_PUBLIC_ANALYTICS_DOMAIN is set at build time
set -euo pipefail

WEB="${STAGING_WEB_URL:-${NEXT_PUBLIC_WEB_URL:-https://virlux-web.vercel.app}}"
DOMAIN="${NEXT_PUBLIC_ANALYTICS_DOMAIN:-}"

if [[ -z "$DOMAIN" ]]; then
  echo "SKIP analytics — NEXT_PUBLIC_ANALYTICS_DOMAIN not set (founder: create Plausible site + Vercel env)"
  exit 0
fi

html=$(curl -sf --max-time 15 "$WEB/" || true)
if echo "$html" | grep -q "plausible.io/js/script.js"; then
  echo "OK  Plausible script on $WEB (domain=$DOMAIN)"
else
  echo "FAIL Plausible script missing on $WEB — set NEXT_PUBLIC_ANALYTICS_DOMAIN on virlux-web and redeploy"
  exit 1
fi

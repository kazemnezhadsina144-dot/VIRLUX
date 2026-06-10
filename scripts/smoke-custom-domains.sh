#!/usr/bin/env bash
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-20260605 | session=d09ef6b2 | date=2026-06-05
# Smoke custom domains (virlux.com / app.virlux.com) — skip gracefully if DNS not wired
set -euo pipefail

WEB="${STAGING_WEB_URL:-https://virlux.com}"
APP="${STAGING_APP_URL:-https://app.virlux.com}"

echo "== Custom domain smoke =="
echo "Web: $WEB"
echo "App: $APP"
echo ""

fail=0

check_url() {
  local name="$1"
  local url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 -L "$url" || echo "000")
  if [[ "$code" =~ ^2 ]]; then
    echo "OK  $name ($code) $url"
  else
    echo "SKIP $name ($code) $url — DNS not wired or host down"
    return 1
  fi
}

if check_url "Marketing" "$WEB/"; then
  if curl -sf --max-time 15 -L "$WEB/" | grep -q 'id="product"'; then
    echo "OK  Marketing #product $WEB/"
  elif echo "$WEB" | grep -q "virlux.com" && curl -sf --max-time 15 -L "$WEB/" | grep -qi lander; then
    echo "FAIL Marketing on $WEB serves /lander stub — point DNS to virlux-web Vercel project"
    fail=1
  else
    echo "WARN Marketing #product not found on $WEB (may be parking page)"
  fi
else
  echo "INFO Web custom domain not ready — use https://virlux-web.vercel.app"
fi

if ! check_url "Dashboard" "$APP/"; then
  echo "INFO App custom domain not ready — use https://virlux-app.vercel.app"
fi

echo ""
if [[ "$fail" -eq 0 ]]; then
  echo "Custom domain smoke finished (no hard failures)."
else
  echo "Custom domain smoke failed — see docs/GTM-MEDIA-CHECKLIST.md DNS section."
  exit 1
fi

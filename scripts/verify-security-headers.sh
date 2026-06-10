#!/usr/bin/env bash
# Verify baseline security headers on live VIRLUX surfaces (PIPEDA / OWASP hygiene).
set -euo pipefail

WEB="${STAGING_WEB_URL:-https://virlux-web.vercel.app}"
APP="${STAGING_APP_URL:-https://virlux-app.vercel.app}"
API="${NEXT_PUBLIC_API_URL:-https://virlux-api.vercel.app}"
# Prefer live API for header check when local API is not running
if [[ "$API" == *localhost* ]]; then
  API="https://virlux-api.vercel.app"
fi

check_header() {
  local name="$1"
  local url="$2"
  local val
  val=$(curl -sSI --max-time 15 "$url" | awk -F': ' "tolower(\$1)==tolower(\"$name\"){print \$2; exit}" | tr -d '\r')
  if [[ -n "$val" ]]; then
    echo "OK  $name on $url"
  else
    echo "FAIL missing $name on $url"
    return 1
  fi
}

echo "== verify:security-headers =="
fail=0
for url in "$WEB/" "$APP/"; do
  check_header "strict-transport-security" "$url" || fail=1
  check_header "x-content-type-options" "$url" || fail=1
  check_header "referrer-policy" "$url" || fail=1
done
check_header "x-content-type-options" "$API/health" || fail=1

for base in "$WEB" "$APP"; do
  if curl -sf --max-time 15 "$base/.well-known/security.txt" | grep -q "Contact:"; then
    echo "OK  security.txt on $base"
  else
    echo "FAIL security.txt missing on $base"
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
echo "== verify:security-headers OK =="

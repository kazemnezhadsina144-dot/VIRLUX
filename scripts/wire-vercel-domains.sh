#!/usr/bin/env bash
# Print Vercel DNS steps for virlux.com + app.virlux.com (founder dashboard or CLI).
set -euo pipefail

SCOPE="${VERCEL_SCOPE:-the-777-foundation}"
WEB_PROJECT="${VERCEL_WEB_PROJECT:-virlux-web}"
APP_PROJECT="${VERCEL_APP_PROJECT:-virlux-app}"

echo "== VIRLUX custom domain wiring =="
echo ""
echo "Dashboard (recommended):"
echo "  Web:  https://vercel.com/${SCOPE}/${WEB_PROJECT}/settings/domains"
echo "  App:  https://vercel.com/${SCOPE}/${APP_PROJECT}/settings/domains"
echo ""
echo "Add domains:"
echo "  virlux.com      → project ${WEB_PROJECT} (marketing)"
echo "  app.virlux.com  → project ${APP_PROJECT} (dashboard)"
echo ""
echo "At your DNS registrar, set records Vercel shows (usually A/CNAME)."
echo "Remove any redirect to /lander on virlux.com — must point to Vercel web build."
echo ""
echo "Verify:"
echo "  npm run smoke:custom-domains"
echo "  curl -sI https://virlux.com/ | head -5"
echo ""

if command -v npx >/dev/null 2>&1 && npx vercel whoami >/dev/null 2>&1; then
  echo "-- Current Vercel domains (if linked) --"
  for proj in "$WEB_PROJECT" "$APP_PROJECT"; do
    echo "[$proj]"
    npx vercel domains ls "$proj" --scope "$SCOPE" 2>/dev/null || echo "  (link project or check scope)"
  done
else
  echo "CLI: npx vercel login && bash scripts/wire-vercel-domains.sh"
fi

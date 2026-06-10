#!/usr/bin/env bash
# Sync optional GTM env vars from .env.staging / secrets → Vercel web+app, then redeploy web.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# shellcheck source=/dev/null
source "$ROOT/scripts/load-tier3-secrets.sh"

if [[ -f "$ROOT/.env.staging" ]]; then
  set -a
  # shellcheck disable=SC1091
  . "$ROOT/.env.staging"
  set +a
fi

missing=0
for key in NEXT_PUBLIC_BOOK_DEMO_URL NEXT_PUBLIC_DEMO_LOOM_URL NEXT_PUBLIC_ANALYTICS_DOMAIN; do
  val="${!key:-}"
  if [[ -z "$val" ]]; then
    echo "SKIP $key — not set in .env.staging or secrets"
    missing=$((missing + 1))
  else
    echo "OK   $key"
  fi
done

if [[ "$missing" -eq 3 ]]; then
  echo ""
  echo "No GTM URLs configured. Add to .env.staging or ~/.sina/secrets.env, then re-run."
  echo "  NEXT_PUBLIC_BOOK_DEMO_URL=https://calendly.com/your-org/30min"
  echo "  NEXT_PUBLIC_DEMO_LOOM_URL=https://www.loom.com/embed/..."
  echo "  NEXT_PUBLIC_ANALYTICS_DOMAIN=virlux.com"
  exit 0
fi

bash "$ROOT/scripts/staging-vercel-env-sync.sh"
echo ""
echo "Redeploy marketing for build-time env: npm run staging:vercel"

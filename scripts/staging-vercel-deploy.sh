#!/usr/bin/env bash
# Deploy VIRLUX web + app to Vercel (requires VERCEL_TOKEN)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -z "${VERCEL_TOKEN:-}" ]]; then
  echo "Set VERCEL_TOKEN (https://vercel.com/account/tokens)"
  exit 1
fi

export VERCEL_TOKEN
VERCEL="npx vercel"

if [[ -f "$ROOT/.env.staging" ]]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' "$ROOT/.env.staging" | grep '^NEXT_PUBLIC_' | xargs)
fi

bash "$ROOT/scripts/staging-validate-env.sh" || echo "WARN: placeholder env — fix before production demos"

deploy_one() {
  local dir="$1"
  local project="$2"
  echo "== Vercel: deploy $project ($dir) =="
  $VERCEL deploy --yes --token "$VERCEL_TOKEN" --cwd "$ROOT/$dir" --prod --project "$project" 2>&1 | tee "/tmp/vercel-${project}.log" | tail -5
  tail -1 "/tmp/vercel-${project}.log"
}

WEB_URL=$(deploy_one "apps/web" "virlux-web")
APP_URL=$(deploy_one "apps/app" "virlux-app")

echo ""
echo "Marketing: $WEB_URL"
echo "Dashboard: $APP_URL"
echo ""
echo "Update Railway CORS_ORIGINS:"
echo "  ${WEB_URL%/},${APP_URL%/}"

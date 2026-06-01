#!/usr/bin/env bash
# Deploy VIRLUX web + app to Vercel (VERCEL_TOKEN or logged-in CLI)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERCEL="npx vercel"
SCOPE="${VERCEL_SCOPE:-the-777-foundation}"
TOKEN_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  export VERCEL_TOKEN
  TOKEN_ARGS=(--token "$VERCEL_TOKEN")
fi

if [[ -f "$ROOT/.env.staging" ]]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' "$ROOT/.env.staging" | grep '^NEXT_PUBLIC_' | xargs)
fi

bash "$ROOT/scripts/staging-validate-env.sh" || echo "WARN: placeholder env — fix before production demos"

deploy_one() {
  local project="$1"
  local config="$2"
  echo "== Vercel: deploy $project =="
  if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
    $VERCEL link --yes "${TOKEN_ARGS[@]}" --scope "$SCOPE" --project "$project" >/dev/null
    $VERCEL deploy --yes "${TOKEN_ARGS[@]}" --scope "$SCOPE" --cwd "$ROOT" --local-config "$config" --prod 2>&1 | tee "/tmp/vercel-${project}.log" | tail -8
  else
    $VERCEL link --yes --scope "$SCOPE" --project "$project" >/dev/null
    $VERCEL deploy --yes --scope "$SCOPE" --cwd "$ROOT" --local-config "$config" --prod 2>&1 | tee "/tmp/vercel-${project}.log" | tail -8
  fi
  grep -E 'https://.*vercel\.app' "/tmp/vercel-${project}.log" | tail -1 || tail -1 "/tmp/vercel-${project}.log"
}

WEB_URL=$(deploy_one "virlux-web" "vercel.json")
APP_URL=$(deploy_one "virlux-app" "vercel.app.json")

echo ""
echo "Marketing: $WEB_URL"
echo "Dashboard: $APP_URL"
echo ""
echo "Update Railway CORS_ORIGINS:"
echo "  ${WEB_URL%/},${APP_URL%/}"

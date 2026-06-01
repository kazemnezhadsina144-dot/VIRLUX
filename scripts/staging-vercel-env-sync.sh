#!/usr/bin/env bash
# Sync NEXT_PUBLIC_* env vars to Vercel (CLI session or VERCEL_TOKEN)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SCOPE="${VERCEL_SCOPE:-the-777-foundation}"
TOKEN_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  export VERCEL_TOKEN
  TOKEN_ARGS=(--token "$VERCEL_TOKEN")
fi

if [[ -f "$ROOT/.env.staging" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.staging"
  set +a
fi

API="${NEXT_PUBLIC_API_URL:-}"
WEB="${NEXT_PUBLIC_WEB_URL:-https://virlux-web.vercel.app}"
APP="${NEXT_PUBLIC_APP_URL:-https://virlux-app.vercel.app}"

if [[ -z "$API" || "$API" == *"YOUR-"* ]]; then
  echo "Set NEXT_PUBLIC_API_URL in .env.staging first"
  exit 1
fi

sync_project() {
  local project="$1"
  shift
  echo "== $project =="
  if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
    npx vercel link --yes "${TOKEN_ARGS[@]}" --scope "$SCOPE" --project "$project" >/dev/null
  else
    npx vercel link --yes --scope "$SCOPE" --project "$project" >/dev/null
  fi
  for pair in "$@"; do
    local key="${pair%%=*}"
    local val="${pair#*=}"
    if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
      npx vercel env add "$key" production --value "$val" --yes --force "${TOKEN_ARGS[@]}" --scope "$SCOPE"
    else
      npx vercel env add "$key" production --value "$val" --yes --force --scope "$SCOPE"
    fi
  done
}

sync_project virlux-web \
  "NEXT_PUBLIC_API_URL=$API" \
  "NEXT_PUBLIC_WEB_URL=$WEB" \
  "NEXT_PUBLIC_APP_URL=$APP"

sync_project virlux-app \
  "NEXT_PUBLIC_API_URL=$API" \
  "NEXT_PUBLIC_WEB_URL=$WEB" \
  "NEXT_PUBLIC_APP_URL=$APP" \
  "NEXT_PUBLIC_DEMO_MODE=true"

echo ""
echo "Done. Redeploy: npm run staging:vercel"

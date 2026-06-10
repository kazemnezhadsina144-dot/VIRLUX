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
  . "$ROOT/.env.staging"
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

WEB_PAIRS=(
  "NEXT_PUBLIC_API_URL=$API"
  "NEXT_PUBLIC_WEB_URL=$WEB"
  "NEXT_PUBLIC_APP_URL=$APP"
)
APP_PAIRS=(
  "NEXT_PUBLIC_API_URL=$API"
  "NEXT_PUBLIC_WEB_URL=$WEB"
  "NEXT_PUBLIC_APP_URL=$APP"
  "NEXT_PUBLIC_DEMO_MODE=true"
)
[[ -n "${NEXT_PUBLIC_BOOK_DEMO_URL:-}" ]] && WEB_PAIRS+=("NEXT_PUBLIC_BOOK_DEMO_URL=$NEXT_PUBLIC_BOOK_DEMO_URL")
[[ -n "${NEXT_PUBLIC_DEMO_LOOM_URL:-}" ]] && WEB_PAIRS+=("NEXT_PUBLIC_DEMO_LOOM_URL=$NEXT_PUBLIC_DEMO_LOOM_URL")
[[ -n "${NEXT_PUBLIC_ANALYTICS_DOMAIN:-}" ]] && WEB_PAIRS+=("NEXT_PUBLIC_ANALYTICS_DOMAIN=$NEXT_PUBLIC_ANALYTICS_DOMAIN")
[[ -n "${NEXT_PUBLIC_BOOK_DEMO_URL:-}" ]] && APP_PAIRS+=("NEXT_PUBLIC_BOOK_DEMO_URL=$NEXT_PUBLIC_BOOK_DEMO_URL")

sync_project virlux-web "${WEB_PAIRS[@]}"
sync_project virlux-app "${APP_PAIRS[@]}"

echo ""
echo "== Production-safe API defaults (virlux-api) =="
LINK_DIR="$ROOT/.vercel-api-link"
mkdir -p "$LINK_DIR"
if [[ ! -f "$LINK_DIR/.vercel/project.json" ]]; then
  (cd "$LINK_DIR" && npx vercel link --yes --scope "$SCOPE" --project virlux-api >/dev/null)
fi
for pair in "DEMO_FUND_ENABLED=false" "ALLOW_OPEN_REGISTRATION=false" "AUTO_SETTLE=false"; do
  key="${pair%%=*}"
  val="${pair#*=}"
  echo "  $key"
  if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
    (cd "$LINK_DIR" && npx vercel env add "$key" production --value "$val" --yes --force "${TOKEN_ARGS[@]}" --scope "$SCOPE")
  else
    (cd "$LINK_DIR" && npx vercel env add "$key" production --value "$val" --yes --force --scope "$SCOPE")
  fi
done

echo ""
echo "Done. Redeploy: npm run staging:vercel-api"

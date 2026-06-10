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

deploy_web() {
  local project="virlux-web"
  echo "== Vercel: deploy $project (repo root + vercel.web.json swap) =="
  cp "$ROOT/vercel.json" "$ROOT/vercel.json.deploy.bak"
  cp "$ROOT/vercel.web.json" "$ROOT/vercel.json"
  trap 'mv "$ROOT/vercel.json.deploy.bak" "$ROOT/vercel.json"' RETURN
  if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
    $VERCEL link --yes "${TOKEN_ARGS[@]}" --scope "$SCOPE" --project "$project" --cwd "$ROOT" >/dev/null
    $VERCEL deploy --yes --archive=tgz "${TOKEN_ARGS[@]}" --scope "$SCOPE" --cwd "$ROOT" --prod 2>&1 | tee "/tmp/vercel-${project}.log" | tail -12
  else
    $VERCEL link --yes --scope "$SCOPE" --project "$project" --cwd "$ROOT" >/dev/null
    $VERCEL deploy --yes --archive=tgz --scope "$SCOPE" --cwd "$ROOT" --prod 2>&1 | tee "/tmp/vercel-${project}.log" | tail -12
  fi
  grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' "/tmp/vercel-${project}.log" | tail -1 || true
}

WEB_URL=$(deploy_web)

# virlux-app: Vercel project Root Directory is usually `apps/app` — deploy from repo root, not apps/app (avoids apps/app/apps/app path)
deploy_app() {
  local project="virlux-app"
  echo "== Vercel: deploy $project (repo root → Vercel Root Directory apps/app) =="
  if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
    $VERCEL link --yes "${TOKEN_ARGS[@]}" --scope "$SCOPE" --project "$project" --cwd "$ROOT" >/dev/null
    $VERCEL deploy --yes --archive=tgz "${TOKEN_ARGS[@]}" --scope "$SCOPE" --cwd "$ROOT" --prod 2>&1 | tee "/tmp/vercel-${project}.log" | tail -12
  else
    $VERCEL link --yes --scope "$SCOPE" --project "$project" --cwd "$ROOT" >/dev/null
    $VERCEL deploy --yes --archive=tgz --scope "$SCOPE" --cwd "$ROOT" --prod 2>&1 | tee "/tmp/vercel-${project}.log" | tail -12
  fi
  grep -oE 'https://[a-zA-Z0-9.-]+\.vercel\.app' "/tmp/vercel-${project}.log" | tail -1 || true
}
APP_URL=$(deploy_app)

echo ""
echo "Marketing: $WEB_URL"
echo "Dashboard: $APP_URL"
echo ""
echo "Update Railway CORS_ORIGINS:"
echo "  ${WEB_URL%/},${APP_URL%/}"

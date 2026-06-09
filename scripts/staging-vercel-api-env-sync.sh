#!/usr/bin/env bash
# Sync .env.staging server vars to virlux-api (linked via .vercel-api-link/)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
SCOPE="${VERCEL_SCOPE:-the-777-foundation}"
LINK_DIR="$ROOT/.vercel-api-link"
VERCEL="npx vercel"

[[ -f .env.staging ]] || { echo "Missing .env.staging"; exit 1; }

mkdir -p "$LINK_DIR"
if [[ ! -f "$LINK_DIR/.vercel/project.json" ]]; then
  (cd "$LINK_DIR" && $VERCEL link --yes --scope "$SCOPE" --project virlux-api >/dev/null)
fi

KEYS=(
  NODE_ENV PORT DATABASE_URL DIRECT_URL JWT_SECRET JWT_ACCESS_TTL JWT_REFRESH_TTL_DAYS
  AUTO_SETTLE SETTLEMENT_MODE ALLOW_ORG_DEPOSIT_CONFIRM APPROVAL_THRESHOLD
  DEMO_APPROVAL_THRESHOLD DEMO_FUND_ENABLED RATE_LIMIT_MAX AUTH_RATE_LIMIT_MAX
  QUOTE_ESTIMATE_RATE_LIMIT_MAX ALLOW_OPEN_REGISTRATION
  CORS_ORIGINS PLATFORM_ADMIN_EMAILS DEPOSIT_WEBHOOK_SECRET
  TELEGRAM_BOT_TOKEN TELEGRAM_BOT_NAME TELEGRAM_MODE TELEGRAM_WEBHOOK_URL
  TELEGRAM_WEBHOOK_SECRET TELEGRAM_ADMIN_CHAT_IDS
  CIRCLE_API_KEY CIRCLE_SANDBOX CIRCLE_WALLET_ID CIRCLE_WEBHOOK_SECRET
)

echo "== Sync env → virlux-api (production) =="
for key in "${KEYS[@]}"; do
  val=$(grep -m1 "^${key}=" "$ROOT/.env.staging" 2>/dev/null | cut -d= -f2- || true)
  [[ -z "$val" ]] && continue
  if [[ "$key" == "DATABASE_URL" && ( "$val" == sqlite:* || "$val" == *"USER:PASS@"* ) ]]; then
    echo "  skip DATABASE_URL — run scripts/staging-supabase-db-url.sh"
    continue
  fi
  echo "  $key"
  (cd "$LINK_DIR" && $VERCEL env add "$key" production --value "$val" --yes --force >/dev/null 2>&1) || true
done
echo "Done. Redeploy: npm run staging:vercel-api"

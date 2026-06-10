#!/usr/bin/env bash
# Prepare VIRLUX_SUPABASE_ANON_KEY for PostgREST security probe (Tier 3 — never commit).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REF="${VIRLUX_SUPABASE_REF:-bueoakgiisvufxfbdvoa}"
SECRETS="${SINA_SECRETS_FILE:-$HOME/.sina/secrets.env}"

PROJECT_URL="https://supabase.com/dashboard/project/${REF}"
API_URL="${PROJECT_URL}/settings/api"
ADVISORS_URL="${PROJECT_URL}/advisors/security"
REST_URL="https://${REF}.supabase.co/rest/v1"

echo "== VIRLUX Supabase anon key setup (PostgREST probe) =="
echo ""
echo "Project: virlux-staging (${REF})"
echo ""
echo "Dashboard links:"
echo "  Project home:     ${PROJECT_URL}"
echo "  API keys (anon):  ${API_URL}"
echo "  Security advisors: ${ADVISORS_URL}"
echo ""
echo "What to copy:"
echo "  • Legacy 'anon' key OR new 'publishable' key from API settings"
echo "  • Starts with eyJ... — use ONLY for this local verify script"
echo "  • NEVER commit, never add NEXT_PUBLIC_* to Vercel web/app"
echo ""
echo "After Jun 8 incident — rotate first, then verify:"
echo "  1. Open API keys → Rotate anon / publishable"
echo "  2. Save new key below → run this script again with --verify"
echo ""

if [[ "${1:-}" == "--print-env" ]]; then
  echo "# Add to ${SECRETS} (one line each):"
  echo "VIRLUX_SUPABASE_REF=${REF}"
  echo "VIRLUX_SUPABASE_ANON_KEY=paste-your-rotated-anon-key-here"
  exit 0
fi

if [[ "${1:-}" == "--set" && -n "${2:-}" ]]; then
  KEY="$2"
  mkdir -p "$(dirname "$SECRETS")"
  touch "$SECRETS"
  chmod 600 "$SECRETS"
  for line in "VIRLUX_SUPABASE_REF=${REF}" "VIRLUX_SUPABASE_ANON_KEY=${KEY}"; do
    var="${line%%=*}"
    if grep -q "^${var}=" "$SECRETS" 2>/dev/null; then
      sed -i.bak "s|^${var}=.*|${line}|" "$SECRETS" && rm -f "${SECRETS}.bak"
    else
      echo "$line" >> "$SECRETS"
    fi
  done
  echo "OK — wrote ${var} to ${SECRETS}"
  shift 2 || true
fi

# shellcheck source=/dev/null
source "$ROOT/scripts/load-tier3-secrets.sh"

if [[ -z "${VIRLUX_SUPABASE_ANON_KEY:-}" ]]; then
  echo "Status: VIRLUX_SUPABASE_ANON_KEY is NOT set"
  echo ""
  echo "Setup (pick one):"
  echo ""
  echo "  A) Manual — add to ${SECRETS}:"
  echo "     bash scripts/setup-supabase-anon-probe.sh --print-env"
  echo ""
  echo "  B) One command (paste key after =):"
  echo "     bash scripts/setup-supabase-anon-probe.sh --set 'eyJ...your-key'"
  echo ""
  echo "  C) Export for this shell only:"
  echo "     export VIRLUX_SUPABASE_ANON_KEY='eyJ...'"
  echo "     npm run verify:supabase-security"
  exit 0
fi

echo "Status: VIRLUX_SUPABASE_ANON_KEY is set (${#VIRLUX_SUPABASE_ANON_KEY} chars)"
echo "PostgREST base: ${REST_URL}"
echo ""

if [[ "${1:-}" == "--verify" || "${1:-}" == "--set" ]]; then
  cd "$ROOT"
  npm run verify:supabase-security
fi

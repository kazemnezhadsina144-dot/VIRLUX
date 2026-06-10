#!/usr/bin/env bash
# CI guardrails — secrets, MSB claims, internal doc leaks
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FAILED=0

fail() {
  echo "CI GUARD FAIL: $1"
  FAILED=1
}

echo "== CI guards =="

# Never commit env files with secrets
for envfile in .env .env.local .env.staging; do
  if git ls-files -- "$envfile" 2>/dev/null | grep -q .; then
    fail "Tracked $envfile detected — must stay gitignored"
  fi
done

# Obvious secret patterns in tracked files (exclude lockfiles and this script)
if git grep -nE 'sk_live_|sk_test_[a-zA-Z0-9]{20,}' -- . ':!package-lock.json' ':!scripts/ci-guards.sh' 2>/dev/null; then
  fail "Possible Stripe/live secret in tracked files"
fi

# todolist must not be tracked
if git ls-files 'todolist/' 2>/dev/null | grep -q .; then
  fail "todolist/ is tracked — run: git rm -r --cached todolist/"
fi

# Playwright artifacts may contain page dumps — never commit
if git ls-files 'test-results/' 'playwright-report/' 2>/dev/null | grep -q .; then
  fail "Playwright test-results/ or playwright-report/ is tracked — add to .gitignore and git rm --cached"
fi

for secfile in apps/web/public/.well-known/security.txt apps/app/public/.well-known/security.txt; do
  if ! git ls-files --error-unmatch "$secfile" >/dev/null 2>&1; then
    fail "Missing $secfile (responsible disclosure)"
  fi
done

# MSB public claims while fintracMsbClaim is false
if grep -q 'fintracMsbClaim: false' packages/shared/src/constants.ts; then
  for phrase in "FINTRAC registered" "Registered MSB" "Licensed MSB" "We are an MSB"; do
    if git grep -nF "$phrase" -- apps/web apps/app 2>/dev/null; then
      fail "Public MSB claim '$phrase' while fintracMsbClaim is false"
    fi
  done
fi

# Competitor identity leak (internal reference only — exclude drift scanner definitions)
if git grep -ni 'kavodax' -- apps/web apps/app packages/shared \
  ':!packages/shared/src/drift-prevention.ts' \
  ':!packages/shared/src/drift-prevention.test.ts' 2>/dev/null; then
  fail "Competitor name must not appear in shipped code"
fi

# Identity copy framing — forbidden competitor-imitation wording on public surfaces
COPY_WORD=$(printf '%s%s' 'cl' 'one')
if git grep -niE "\\b${COPY_WORD}\\b|\\b${COPY_WORD}ing\\b" -- apps/web apps/app packages/shared \
  ':!packages/shared/src/drift-prevention.ts' \
  ':!packages/shared/src/drift-prevention.test.ts' 2>/dev/null; then
  fail "Public surfaces must not use competitor-imitation wording"
fi

# Supabase: new Prisma tables must enable RLS (blocks anon/authenticated PostgREST)
RLS_BASELINE="20250608000000_enable_rls"
REVOKE_BASELINE="20250609000000_revoke_postgrest_grants"
DENY_BASELINE="20250610000000_deny_postgrest_policies"
for mig in "$ROOT"/apps/api/prisma/migrations/*/migration.sql; do
  dir=$(basename "$(dirname "$mig")")
  [[ "$dir" == "$RLS_BASELINE" || "$dir" == "$REVOKE_BASELINE" || "$dir" == "$DENY_BASELINE" ]] && continue
  [[ "$dir" < "$RLS_BASELINE" ]] && continue
  if grep -qiE 'CREATE TABLE' "$mig"; then
    if ! grep -qi 'ENABLE ROW LEVEL SECURITY' "$mig"; then
      fail "Migration $dir creates table(s) without ENABLE ROW LEVEL SECURITY (Supabase exposure)"
    fi
    if [[ "$dir" > "$REVOKE_BASELINE" || "$dir" == "$REVOKE_BASELINE" ]] && ! grep -qi 'REVOKE ALL' "$mig"; then
      fail "Migration $dir creates table(s) without REVOKE ALL FROM anon, authenticated"
    fi
  fi
done

# Never ship Supabase secret/service_role keys or browser Supabase client env vars
if git grep -nE 'NEXT_PUBLIC_SUPABASE_|SUPABASE_SERVICE_ROLE|service_role' -- apps/web apps/app packages/shared api 2>/dev/null; then
  fail "Supabase client or service_role keys must not appear in shipped frontend/API code"
fi

if git grep -nF 'demo12345' -- apps packages e2e scripts README.md 2>/dev/null \
  ':!scripts/ci-guards.sh' ':!docs/receipts/' ':!os/agents/'; then
  fail "Committed demo12345 password — use DEMO_SEED_PASSWORD / E2E_DEMO_PASSWORD env"
fi

if git grep -nE 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+' -- apps apps/api packages api \
  ':!scripts/ci-guards.sh' 2>/dev/null; then
  fail "Possible committed JWT/API key in source — use env vars only"
fi

if git grep -nE 'allowOpenRegistration.*\|\|.*ALLOW_OPEN_REGISTRATION' -- apps/api/src/lib/config.ts 2>/dev/null; then
  fail "allowOpenRegistration must not be bypassable in production via env"
fi

if [ "$FAILED" -ne 0 ]; then
  exit 1
fi

echo "CI guards passed."

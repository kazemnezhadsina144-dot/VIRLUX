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

if [ "$FAILED" -ne 0 ]; then
  exit 1
fi

echo "CI guards passed."

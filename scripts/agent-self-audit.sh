#!/usr/bin/env bash
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-20260603 | session=d09ef6b2 | date=2026-06-03
# Self-audit loop for Auto · VIRLUX Delivery — tag consistency + optional verify:live
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

AGENT_HOME="os/agents/auto-virlux-delivery"
AUTHOR="Auto-VIRLUX-Delivery"
TAG_PREFIX="VIRLUX-AUTO-DELIVERY"
DATE_ISO="$(date +%Y-%m-%d)"
DATE_TAG="$(date +%Y%m%d)"

echo "== Self-audit: $AUTHOR | $DATE_ISO =="
echo ""

FAIL=0

warn() { echo "WARN: $*"; }
fail() { echo "FAIL: $*"; FAIL=1; }
ok() { echo "OK: $*"; }

# --- Pre-flight files exist ---
for f in MEMORY.md INCIDENTS.md AUDIT-LOG.md REGISTRY.md LOOP.md IDENTITY.md; do
  if [[ -f "$AGENT_HOME/$f" ]]; then
    ok "agent home $f"
  else
    fail "missing $AGENT_HOME/$f"
  fi
done
echo ""

# --- Registry paths: must exist and carry our author or dated tag ---
echo "-- Registry ownership scan --"
REGISTRY="$AGENT_HOME/REGISTRY.md"
if [[ ! -f "$REGISTRY" ]]; then
  fail "REGISTRY.md missing"
else
  IN_MINE=0
  while IFS= read -r line; do
    case "$line" in
      "## Agent home"*|"## Ops docs"*) IN_MINE=1; continue ;;
      "## Explicitly NOT mine"*) IN_MINE=0; continue ;;
      "## Register new"*) IN_MINE=0; continue ;;
    esac
    [[ "$IN_MINE" -eq 0 ]] && continue
    path="$(echo "$line" | sed -n 's/^| `\([^`]*\)` |.*/\1/p')"
    [[ -z "$path" ]] && continue
    if [[ ! -e "$path" ]]; then
      warn "registry path missing on disk: $path"
      continue
    fi
    [[ "$path" == *.json ]] && continue
    if ! head -20 "$path" 2>/dev/null | grep -q "author: $AUTHOR\|author=$AUTHOR"; then
      fail "$path in REGISTRY but missing author $AUTHOR in header"
    fi
    if ! head -20 "$path" 2>/dev/null | grep -qE "${TAG_PREFIX}-[0-9]{8}|tag=${TAG_PREFIX}-[0-9]{8}"; then
      fail "$path missing dated tag ${TAG_PREFIX}-YYYYMMDD"
    fi
  done < "$REGISTRY"
fi
echo ""

# --- Orphan: our author on files not in registry (informational) ---
echo "-- Tagged docs outside registry (informational) --"
while IFS= read -r f; do
  [[ "$f" == "$REGISTRY" ]] && continue
  [[ "$f" == "$AGENT_HOME/"* ]] && continue
  if ! grep -qF "`$f`" "$REGISTRY" 2>/dev/null; then
    warn "tagged but not in REGISTRY: $f"
  fi
done < <(rg -l "author: $AUTHOR|author=$AUTHOR" --glob '*.md' --glob '*.sh' . 2>/dev/null || true)
echo ""

# --- Other-agent doc collision check ---
echo "-- Other-agent doc check (do not edit these) --"
OTHER_COUNT=0
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  header="$(head -15 "$f" 2>/dev/null || true)"
  if echo "$header" | grep -q 'VIRLUX-AGENT-DOC'; then
    if echo "$header" | grep -q "author: $AUTHOR\|author=$AUTHOR"; then
      continue
    fi
    echo "  $f"
    OTHER_COUNT=$((OTHER_COUNT + 1))
  fi
done < <(rg -l 'VIRLUX-AGENT-DOC' . 2>/dev/null || true)
if [[ "$OTHER_COUNT" -eq 0 ]]; then
  ok "no other-agent VIRLUX-AGENT-DOC files in repo"
else
  ok "$OTHER_COUNT other-agent file(s) listed above — read-only"
fi
echo ""

# --- Optional verify ---
if [[ "${1:-}" == "--verify" ]]; then
  echo "-- verify:live --"
  npm run verify:live
  echo ""
fi

# --- Audit reminder ---
echo "-- Post-flight (manual) --"
echo "  1. Append $AGENT_HOME/AUDIT-LOG.md (AUD-${DATE_TAG}-NNN)"
echo "  2. Update MEMORY.md / INCIDENTS.md if facts or mistakes changed"
echo "  3. New files → REGISTRY.md with tag ${TAG_PREFIX}-${DATE_TAG}"
echo ""

if [[ "$FAIL" -ne 0 ]]; then
  echo "Self-audit FAILED ($FAIL checks)"
  exit 1
fi

echo "Self-audit PASSED"

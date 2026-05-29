#!/usr/bin/env bash
# One-time GitHub push setup for kazemnezhadsina144-dot/VIRLUX
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GH="$ROOT/.tools/gh_2.67.0_macOS_arm64/bin/gh"
KEY="$HOME/.ssh/virlux_github.pub"
BRANCH="${1:-cursor/virlux-v2-platform-and-todolist}"

echo "=== VIRLUX GitHub push setup ==="
echo ""
echo "Repo: git@github.com:kazemnezhadsina144-dot/VIRLUX.git"
echo "Branch: $BRANCH"
echo ""

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  echo "Using GITHUB_TOKEN..."
  echo "$GITHUB_TOKEN" | "$GH" auth login --with-token
  cd "$ROOT" && git push -u origin "$BRANCH"
  echo "Push complete."
  exit 0
fi

if [[ -f "$KEY" ]]; then
  echo "Option A — SSH deploy key (add to GitHub once):"
  echo "  https://github.com/kazemnezhadsina144-dot/VIRLUX/settings/keys"
  echo "  Title: virlux-cursor-push | Allow write access: YES"
  echo ""
  cat "$KEY"
  echo ""
  echo "Then run: git push -u origin $BRANCH"
  echo ""
fi

echo "Option B — GitHub CLI device login:"
echo "  $GH auth login --web -h github.com -p https -s repo"
echo "  git push -u origin $BRANCH"
echo ""
echo "Option C — Personal access token:"
echo "  GITHUB_TOKEN=ghp_... bash $ROOT/scripts/setup-github-push.sh"

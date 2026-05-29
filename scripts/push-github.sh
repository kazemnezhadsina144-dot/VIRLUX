#!/usr/bin/env bash
# Push to GitHub — requires GITHUB_TOKEN or prior `gh auth login`
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GH="$ROOT/.tools/gh_2.67.0_macOS_arm64/bin/gh"
BRANCH="${1:-cursor/virlux-v2-platform-and-todolist}"

cd "$ROOT"

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  echo "$GITHUB_TOKEN" | "$GH" auth login --with-token
fi

"$GH" auth status || {
  echo "Run: $GH auth login --web"
  echo "Or:  GITHUB_TOKEN=ghp_... bash scripts/push-github.sh"
  exit 1
}

git push -u origin "$BRANCH"
echo "Pushed $BRANCH to origin"

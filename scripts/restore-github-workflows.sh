#!/usr/bin/env bash
# Restore .github/workflows on GitHub (requires gh workflow scope or classic PAT with workflow)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GH="$ROOT/.tools/gh_2.67.0_macOS_arm64/bin/gh"

cd "$ROOT"

if ! "$GH" auth status 2>&1 | grep -q workflow; then
  echo "Grant workflow scope first:"
  echo "  $GH auth refresh -h github.com -s repo,workflow"
  echo "  Open https://github.com/login/device and enter the code shown"
  exit 1
fi

"$GH" auth setup-git
git push --force origin cursor/virlux-v2-platform-and-todolist main
echo "GitHub Actions workflows restored on remote."

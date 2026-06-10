#!/usr/bin/env bash
# Source Tier-3 secrets for staging verify/deploy (never commit secrets.env).
set -euo pipefail

SECRETS="${SINA_SECRETS_FILE:-$HOME/.sina/secrets.env}"
if [[ -f "$SECRETS" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$SECRETS"
  set +a
fi

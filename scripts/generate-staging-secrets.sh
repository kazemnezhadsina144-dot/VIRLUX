#!/usr/bin/env bash
# Print random secrets for staging Railway env (copy into dashboard — do not commit)
set -euo pipefail

jwt=$(openssl rand -hex 32)
webhook=$(openssl rand -hex 16)

echo "=== VIRLUX staging secrets (paste into Railway) ==="
echo ""
echo "JWT_SECRET=${jwt}"
echo "TELEGRAM_WEBHOOK_SECRET=${webhook}"
echo "DEPOSIT_WEBHOOK_SECRET=${webhook}"
echo ""
echo "Keep these out of git. Regenerate if leaked."

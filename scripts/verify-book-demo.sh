#!/usr/bin/env bash
# VIRLUX-AGENT-DOC | author=Auto-VIRLUX-Delivery | tag=VIRLUX-AUTO-DELIVERY-20260606 | session=d09ef6b2 | date=2026-06-06
# Assert Book a demo CTA on live marketing web (Calendly or mailto fallback)
set -euo pipefail

WEB="${STAGING_WEB_URL:-${NEXT_PUBLIC_WEB_URL:-https://virlux-web.vercel.app}}"
PATH_TO_CHECK="${1:-/pricing}"

echo "== verify:book-demo =="
echo "URL: ${WEB}${PATH_TO_CHECK}"

HTML="$(curl -fsSL "${WEB}${PATH_TO_CHECK}")"

if ! echo "$HTML" | grep -qi 'book a demo'; then
  echo "FAIL: no 'Book a demo' text in HTML"
  exit 1
fi

HREF="$(echo "$HTML" | grep -oiE 'href="[^"]*"[^>]*>[^<]*[Bb]ook a demo' | head -1 | sed -n 's/.*href="\([^"]*\)".*/\1/p')"

if [[ -z "$HREF" ]]; then
  HREF="$(echo "$HTML" | grep -oiE 'href="[^"]*"[^>]*book a demo' | head -1 | sed -n 's/.*href="\([^"]*\)".*/\1/p')"
fi

if [[ -z "$HREF" ]]; then
  echo "FAIL: could not extract Book a demo href"
  exit 1
fi

if [[ "$HREF" =~ ^https?:// ]]; then
  echo "OK: Book a demo → external URL (${HREF:0:60}...)"
elif [[ "$HREF" =~ ^mailto: ]]; then
  echo "OK: Book a demo → mailto fallback (set NEXT_PUBLIC_BOOK_DEMO_URL for Calendly)"
else
  echo "FAIL: unexpected href: $HREF"
  exit 1
fi

echo "== verify:book-demo OK =="

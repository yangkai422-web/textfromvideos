#!/bin/sh
set -eu

COOKIE_PATH="${YTDLP_COOKIES_FILE:-/tmp/tiktok-cookies.txt}"

write_cookies() {
  chmod 600 "$COOKIE_PATH"
  export YTDLP_COOKIES_FILE="$COOKIE_PATH"
}

if [ -n "${YTDLP_COOKIES_B64:-}" ]; then
  tmp="$(mktemp)"
  printf '%s' "$YTDLP_COOKIES_B64" | base64 -d > "$tmp"
  if gzip -t "$tmp" 2>/dev/null; then
    gzip -d -c "$tmp" > "$COOKIE_PATH"
  else
    cp "$tmp" "$COOKIE_PATH"
  fi
  rm -f "$tmp"
  write_cookies
  unset YTDLP_COOKIES_B64
elif [ -n "${YTDLP_COOKIES:-}" ]; then
  printf '%s' "$YTDLP_COOKIES" > "$COOKIE_PATH"
  write_cookies
  unset YTDLP_COOKIES
fi

exec node server.js

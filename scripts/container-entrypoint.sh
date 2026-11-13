#!/bin/sh
set -eu

COOKIE_PATH="${YTDLP_COOKIES_FILE:-/tmp/tiktok-cookies.txt}"

write_cookies() {
  chmod 600 "$COOKIE_PATH"
  export YTDLP_COOKIES_FILE="$COOKIE_PATH"
}

if [ -n "${YTDLP_COOKIES_B64:-}" ]; then
  printf '%s' "$YTDLP_COOKIES_B64" | base64 -d > "$COOKIE_PATH"
  write_cookies
  unset YTDLP_COOKIES_B64
elif [ -n "${YTDLP_COOKIES:-}" ]; then
  printf '%s' "$YTDLP_COOKIES" > "$COOKIE_PATH"
  write_cookies
  unset YTDLP_COOKIES
fi

exec node server.js

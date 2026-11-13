#!/usr/bin/env bash
# Install / upgrade the host tools used by lib/media.ts to fetch captions and audio.
# ffmpeg/ffprobe should come from the OS package manager.
set -euo pipefail

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required to install yt-dlp" >&2
  exit 1
fi

python3 -m pip install -U yt-dlp

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is not on PATH. Install it (e.g. apt install ffmpeg) before transcribing." >&2
  exit 1
fi

if ! command -v ffprobe >/dev/null 2>&1; then
  echo "ffprobe is not on PATH. It usually ships with ffmpeg." >&2
  exit 1
fi

echo "yt-dlp: $(yt-dlp --version)"
ffmpeg -version | head -n 1
ffprobe -version | head -n 1

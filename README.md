# textfromvideos.com

Free TikTok and Instagram Reels transcript tool. Paste a public video link and get text you can copy or download as TXT / SRT.

## Local run

```bash
cp .env.example .env.local
# Fill in the keys and, when ready, DATABASE_URL. Do not commit .env.local.
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Then:

```bash
pnpm typecheck
pnpm lint
```

## Environment variables

| Name | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes in production | `https://textfromvideos.com` |
| `DATABASE_URL` | for durable cache | Postgres. Apply `db/schema.sql`. If unset, the API still runs with a temporary in-memory cache (lost on restart, not shared across instances). |
| `ASR_PROVIDER` | no | `deepgram` (default), `assemblyai`, or `openai` |
| `ASR_API_KEY` | fallback | Used when a provider-specific key is missing |
| `DEEPGRAM_API_KEY` | for Deepgram | Preferred for the default provider |
| `ASSEMBLYAI_API_KEY` | for AssemblyAI | |
| `OPENAI_API_KEY` | for Whisper | Only used when `ASR_PROVIDER=openai`. Do not enable until the account has credits. |
| `YTDLP_PATH`, `FFMPEG_PATH`, `FFPROBE_PATH` | no | Defaults to the binary names on `PATH` |
| `YTDLP_COOKIES_FILE` | no | Netscape cookies file if Instagram (or some TikTok) downloads need a logged-in session |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | no | Loads gtag when set to a `G-...` id |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | no | Loads the Plausible script when set |

Copy `.env.example` to `.env.local` and leave secret values out of git. `.secrets/` is also ignored.

## Media tools (captions + audio)

The transcribe API uses `yt-dlp` and `ffmpeg`/`ffprobe` on the Node.js server (not a Cloudflare Worker). Install them on the host:

```bash
./scripts/install-media-tools.sh
```

This needs a long-running Node host. Vanilla serverless (short-lived Vercel functions without these binaries) is a poor fit until the media layer is adapted.

## Database

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

`transcripts` is the 7-day cache. `jobs` records request status. `events` stores first-party analytics and the unpaid daily quota.

## Analytics

The UI posts `transcribe_start`, `transcribe_success`, and `copy_click` to `/api/events`. The same helper also pushes to `window.dataLayer`, calls `gtag('event', name)` when present, and calls `window.plausible?.(name)`. Add GA4 or Plausible later by setting the public env vars above — no code change is required.

## Stack

Next.js App Router, TypeScript, and Tailwind. Homepage Title, H1, description, and FAQ are server-rendered so they appear in view-source.

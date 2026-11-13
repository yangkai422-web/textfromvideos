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
| `YTDLP_COOKIES_FILE` | no | Local path to a Netscape cookies file if Instagram (or some TikTok) downloads need a logged-in session |
| `YTDLP_COOKIES_B64` | no | Production Worker secret: base64 of that Netscape file. The container writes it to `/tmp/tiktok-cookies.txt` on start |
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

## Production deploy (Cloudflare Containers)

The live site is a Cloudflare Worker (`textfromvideos-app`) that forwards requests to a Container running this Next.js app with `yt-dlp`, `ffmpeg`, and `ffprobe`. The custom domain `https://textfromvideos.com` is attached to that Worker. `www` stays a proxied CNAME and is 301-redirected to the apex by the existing Cloudflare Redirect Rule. SSL is Full (strict); Always Use HTTPS stays on.

Secrets are **not** in the git repo or the image. They live as Worker secrets on the `textfromvideos-app` Worker in account `62ffbf61f44b6e2e24c9c0d483181eec` (Yangkai422@gmail.com) and are passed into the container when it starts:

- `DATABASE_URL`
- `DEEPGRAM_API_KEY`
- `ASSEMBLYAI_API_KEY`
- `OPENAI_API_KEY`
- `ASR_API_KEY` (same value as the Deepgram key)
- `ASR_PROVIDER` and `NEXT_PUBLIC_SITE_URL` are plain Worker vars (`deepgram` and `https://textfromvideos.com`)

Do not set `ASR_PROVIDER=openai` in production until the OpenAI account has credits.

Public TikTok downloads from the Cloudflare Container IP can fail with yt-dlp `HTTP Error 403: Forbidden` (the API surfaces this as `private_video`). To unblock, export a Netscape cookies file from a logged-in browser session, then set the Worker secret `YTDLP_COOKIES_B64` to the base64 of that file (do not commit the file or paste it in chat). The container writes it to `/tmp/tiktok-cookies.txt` on start.

### Redeploy

Docker must be running locally (Wrangler builds and pushes the image from `Dockerfile`). From the repo root, authenticated to the yangkai422 Cloudflare account:

```bash
npx wrangler deploy
```

If you rotate secrets:

```bash
npx wrangler secret put DATABASE_URL
# or: npx wrangler secret bulk path-to-a-local-json-file
```

`wrangler secret put` publishes a new Worker version immediately. After secret changes, the next request starts a new container so it picks up the new environment. Do not commit `.env`, `.env.local`, `.dev.vars`, or `.secrets/`.

The first deploy (or a cold container) can take a few minutes before `/health` succeeds. Do not point the custom domain at a new Worker until `https://textfromvideos-app.yangkai422.workers.dev/health` returns 200.

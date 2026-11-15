export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://textfromvideos.com";

export const FREE_MAX_DURATION_SEC = 180;
export const TRANSCRIBE_TIMEOUT_MS = 90_000;
export const CACHE_TTL_DAYS = 7;
export const FREE_DAILY_LIMIT = 3;
/** Max recorded pipeline failures per IP per UTC day (excludes rate/retry caps). */
export const FREE_FAILURE_LIMIT = 5;
/** Do not rerun speech-to-text for a video that failed this recently. */
export const VIDEO_FAILURE_COOLDOWN_HOURS = 6;

export type AsrProvider = "deepgram" | "assemblyai" | "openai";

export function getAsrProvider(): AsrProvider {
  const raw = (process.env.ASR_PROVIDER ?? "deepgram").trim().toLowerCase();
  if (raw === "assemblyai" || raw === "openai" || raw === "deepgram") {
    return raw;
  }
  return "deepgram";
}

function firstEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** Provider-specific key first, then the shared ASR_API_KEY fallback. */
export function getAsrApiKey(provider: AsrProvider = getAsrProvider()): string | undefined {
  if (provider === "deepgram") {
    return firstEnv("DEEPGRAM_API_KEY", "ASR_API_KEY");
  }
  if (provider === "assemblyai") {
    return firstEnv("ASSEMBLYAI_API_KEY", "ASR_API_KEY");
  }
  return firstEnv("OPENAI_API_KEY", "ASR_API_KEY");
}

export function getYtDlpPath(): string {
  return process.env.YTDLP_PATH?.trim() || "yt-dlp";
}

export function getFfmpegPath(): string {
  return process.env.FFMPEG_PATH?.trim() || "ffmpeg";
}

export function getFfprobePath(): string {
  return process.env.FFPROBE_PATH?.trim() || "ffprobe";
}

/** Optional Netscape cookies file for Instagram (and some TikTok) fetches. */
export function getYtDlpCookiesFile(): string | undefined {
  return process.env.YTDLP_COOKIES_FILE?.trim() || undefined;
}

export function isDurableDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

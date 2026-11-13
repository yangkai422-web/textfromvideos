import { CACHE_TTL_DAYS, isDurableDatabaseConfigured } from "./config";
import { getPool, query, warnTemporaryStore } from "./db";
import type { Platform } from "./platform";
import type { TranscriptPayload } from "./transcript-format";

export type CachedTranscript = TranscriptPayload & {
  platform: Platform;
  videoId: string;
  createdAt: Date;
};

type TranscriptRow = {
  platform: string;
  video_id: string;
  lang: string | null;
  source: string | null;
  text: string | null;
  srt: string | null;
  created_at: Date;
};

type MemoryEntry = {
  value: CachedTranscript;
  expiresAt: number;
};

const memory = new Map<string, MemoryEntry>();
const TTL_MS = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

function memoryKey(platform: Platform, videoId: string, lang?: string): string {
  return `${platform}:${videoId}:${lang ?? "*"}`;
}

function isFresh(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() < TTL_MS;
}

function rowToCached(row: TranscriptRow): CachedTranscript | null {
  if (!row.text && !row.srt) return null;
  if (row.platform !== "tiktok" && row.platform !== "instagram") return null;
  const source = row.source === "captions" ? "captions" : "asr";
  const createdAt = new Date(row.created_at);
  if (!isFresh(createdAt)) return null;
  return {
    platform: row.platform,
    videoId: row.video_id,
    text: row.text ?? "",
    srt: row.srt ?? "",
    vtt: "", // filled by caller via srtToVtt to keep this module focused
    lang: row.lang || "und",
    source,
    createdAt,
  };
}

function getFromMemory(
  platform: Platform,
  videoId: string,
  lang?: string,
): CachedTranscript | null {
  warnTemporaryStore("Transcript cache");
  const now = Date.now();
  const prefix = `${platform}:${videoId}:`;
  let newest: CachedTranscript | null = null;
  for (const [key, entry] of memory) {
    if (!key.startsWith(prefix)) continue;
    if (entry.expiresAt <= now) {
      memory.delete(key);
      continue;
    }
    if (lang && entry.value.lang !== lang) continue;
    if (!newest || entry.value.createdAt > newest.createdAt) {
      newest = entry.value;
    }
  }
  return newest;
}

/**
 * Look up a cached transcript. Hits within 7 days of created_at are returned
 * so later requests incur zero ASR cost.
 *
 * If DATABASE_URL is missing, this uses a temporary in-memory map and is not durable.
 */
export async function getCachedTranscript(
  platform: Platform,
  videoId: string,
  lang?: string,
): Promise<CachedTranscript | null> {
  if (!isDurableDatabaseConfigured()) {
    return getFromMemory(platform, videoId, lang);
  }

  const result = lang
    ? await query<TranscriptRow>(
        `select platform, video_id, lang, source, text, srt, created_at
         from transcripts
         where platform = $1
           and video_id = $2
           and lang = $3
           and created_at > now() - interval '7 days'
         order by created_at desc
         limit 1`,
        [platform, videoId, lang],
      )
    : await query<TranscriptRow>(
        `select platform, video_id, lang, source, text, srt, created_at
         from transcripts
         where platform = $1
           and video_id = $2
           and created_at > now() - interval '7 days'
         order by created_at desc
         limit 1`,
        [platform, videoId],
      );

  const row = result?.rows[0];
  if (!row) return null;
  return rowToCached(row);
}

export async function saveTranscript(input: {
  platform: Platform;
  videoId: string;
  payload: TranscriptPayload;
}): Promise<void> {
  const createdAt = new Date();
  const cached: CachedTranscript = {
    ...input.payload,
    platform: input.platform,
    videoId: input.videoId,
    createdAt,
  };

  if (!isDurableDatabaseConfigured()) {
    warnTemporaryStore("Transcript cache");
    const key = memoryKey(input.platform, input.videoId, input.payload.lang);
    memory.set(key, { value: cached, expiresAt: createdAt.getTime() + TTL_MS });
    return;
  }

  const pool = getPool();
  if (!pool) return;
  await pool.query(
    `insert into transcripts (platform, video_id, lang, source, text, srt)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (platform, video_id, lang)
     do update set
       source = excluded.source,
       text = excluded.text,
       srt = excluded.srt,
       created_at = now()`,
    [
      input.platform,
      input.videoId,
      input.payload.lang || "und",
      input.payload.source,
      input.payload.text,
      input.payload.srt,
    ],
  );
}

import {
  FREE_FAILURE_LIMIT,
  VIDEO_FAILURE_COOLDOWN_HOURS,
  isDurableDatabaseConfigured,
} from "./config";
import { ERRORS, TranscribeError, type TranscribeErrorCode } from "./errors";
import { isMissingRelation, query, warnTemporaryStore } from "./db";
import type { Platform } from "./platform";

type FailureRecord = {
  code: TranscribeErrorCode;
  status: number;
  message: string;
  platform: Platform;
  videoId: string;
};

type MemoryFailure = FailureRecord & {
  ip: string;
  createdAt: number;
};

const memoryFailures: MemoryFailure[] = [];

const IP_COUNTED_CODES: ReadonlySet<TranscribeErrorCode> = new Set([
  "private_video",
  "no_media",
  "timeout",
  "internal",
]);

function utcDayStart(now = Date.now()): number {
  const day = new Date(now).toISOString().slice(0, 10);
  return Date.parse(`${day}T00:00:00.000Z`);
}

function shouldRecord(error: TranscribeError): boolean {
  return error.code !== "rate_limit" && error.code !== "retry_limit";
}

function countsTowardIpCap(code: TranscribeErrorCode): boolean {
  return IP_COUNTED_CODES.has(code);
}

function toError(record: FailureRecord): TranscribeError {
  return new TranscribeError(record.message, record.status, record.code);
}

function recordInMemory(
  ip: string,
  platform: Platform,
  videoId: string,
  error: TranscribeError,
): void {
  memoryFailures.push({
    ip,
    platform,
    videoId,
    code: error.code,
    status: error.status,
    message: error.message,
    createdAt: Date.now(),
  });
}

function recentVideoFailureFromMemory(
  platform: Platform,
  videoId: string,
): FailureRecord | null {
  const cutoff = Date.now() - VIDEO_FAILURE_COOLDOWN_HOURS * 60 * 60 * 1000;
  let newest: MemoryFailure | null = null;
  for (const entry of memoryFailures) {
    if (entry.platform !== platform || entry.videoId !== videoId) continue;
    if (entry.createdAt < cutoff) continue;
    if (!newest || entry.createdAt > newest.createdAt) newest = entry;
  }
  return newest;
}

function ipFailureCountFromMemory(ip: string): number {
  const start = utcDayStart();
  return memoryFailures.filter(
    (entry) => entry.ip === ip && entry.createdAt >= start && countsTowardIpCap(entry.code),
  ).length;
}

/**
 * If this video already failed recently, return the same public error
 * instead of calling yt-dlp or speech-to-text again.
 */
export async function assertVideoNotRecentlyFailed(
  platform: Platform,
  videoId: string,
): Promise<void> {
  if (!isDurableDatabaseConfigured()) {
    warnTemporaryStore("Failure retry cap");
    const recorded = recentVideoFailureFromMemory(platform, videoId);
    if (recorded) throw toError(recorded);
    return;
  }

  try {
    const result = await query<{
      payload: FailureRecord | string | null;
    }>(
      `select payload
       from events
       where name = 'transcribe_failure'
         and payload->>'platform' = $1
         and payload->>'video_id' = $2
         and created_at > now() - ($3::int * interval '1 hour')
       order by created_at desc
       limit 1`,
      [platform, videoId, VIDEO_FAILURE_COOLDOWN_HOURS],
    );
    const raw = result?.rows[0]?.payload;
    if (!raw) return;
    const payload = typeof raw === "string" ? (JSON.parse(raw) as FailureRecord) : raw;
    if (payload?.code && payload?.message) {
      throw toError({
        code: payload.code,
        status: payload.status || 422,
        message: payload.message,
        platform,
        videoId,
      });
    }
  } catch (error) {
    if (error instanceof TranscribeError) throw error;
    if (isMissingRelation(error)) {
      console.warn("[textfromvideos] events table missing; using in-memory failure cap. Apply db/schema.sql.");
    } else {
      console.warn("[textfromvideos] durable video failure lookup failed; using in-memory fallback", error);
    }
    const recorded = recentVideoFailureFromMemory(platform, videoId);
    if (recorded) throw toError(recorded);
  }
}

/**
 * Stop an IP from burning speech-to-text credit with a burst of failures.
 */
export async function assertFailureRetryCap(ip: string): Promise<void> {
  if (!isDurableDatabaseConfigured()) {
    warnTemporaryStore("Failure retry cap");
    if (ipFailureCountFromMemory(ip) >= FREE_FAILURE_LIMIT) throw ERRORS.retryLimit();
    return;
  }

  try {
    const result = await query<{ count: string }>(
      `select count(*)::text as count
       from events
       where name = 'transcribe_failure'
         and ip = $1
         and created_at >= date_trunc('day', timezone('utc', now()))
         and payload->>'code' = any($2::text[])`,
      [ip, Array.from(IP_COUNTED_CODES)],
    );
    const used = Number(result?.rows[0]?.count ?? 0);
    if (used >= FREE_FAILURE_LIMIT) throw ERRORS.retryLimit();
  } catch (error) {
    if (error instanceof TranscribeError) throw error;
    if (isMissingRelation(error)) {
      console.warn("[textfromvideos] events table missing; using in-memory failure cap. Apply db/schema.sql.");
    } else {
      console.warn("[textfromvideos] durable IP failure cap failed; using in-memory fallback", error);
    }
    if (ipFailureCountFromMemory(ip) >= FREE_FAILURE_LIMIT) throw ERRORS.retryLimit();
  }
}

export async function recordTranscribeFailure(
  ip: string,
  platform: Platform,
  videoId: string,
  error: TranscribeError,
): Promise<void> {
  if (!shouldRecord(error)) return;

  const payload: FailureRecord = {
    platform,
    videoId,
    code: error.code,
    status: error.status,
    message: error.message,
  };

  if (!isDurableDatabaseConfigured()) {
    warnTemporaryStore("Failure retry cap");
    recordInMemory(ip, platform, videoId, error);
    return;
  }

  try {
    await query(
      `insert into events (name, ip, payload) values ('transcribe_failure', $1, $2::jsonb)`,
      [ip, JSON.stringify({ ...payload, video_id: videoId })],
    );
  } catch (cause) {
    if (isMissingRelation(cause)) {
      console.warn("[textfromvideos] events table missing; recording failure in memory. Apply db/schema.sql.");
    } else {
      console.warn("[textfromvideos] durable failure record failed; recording in memory", cause);
    }
    recordInMemory(ip, platform, videoId, error);
  }
}

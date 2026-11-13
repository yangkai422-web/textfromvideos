import { FREE_DAILY_LIMIT, isDurableDatabaseConfigured } from "./config";
import { ERRORS, TranscribeError } from "./errors";
import { isMissingRelation, query, warnTemporaryStore } from "./db";

const memoryCounts = new Map<string, number>();

function utcDayKey(ip: string, now = new Date()): string {
  const day = now.toISOString().slice(0, 10);
  return `${day}:${ip}`;
}

function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cfIp = headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  return "unknown";
}

export function getClientIp(headers: Headers): string {
  return clientIpFromHeaders(headers);
}

function consumeMemoryQuota(ip: string): void {
  const key = utcDayKey(ip);
  const used = memoryCounts.get(key) ?? 0;
  if (used >= FREE_DAILY_LIMIT) throw ERRORS.rateLimit();
  memoryCounts.set(key, used + 1);
}

/**
 * Enforce the unpaid daily cap (3 requests / IP) for cache-miss transcribe work.
 * Uses the events table when DATABASE_URL is set; otherwise a temporary in-memory counter.
 */
export async function assertFreeQuota(ip: string): Promise<void> {
  if (!isDurableDatabaseConfigured()) {
    warnTemporaryStore("Rate limit");
    consumeMemoryQuota(ip);
    return;
  }

  try {
    const result = await query<{ count: string }>(
      `select count(*)::text as count
       from events
       where name = 'transcribe_quota'
         and ip = $1
         and created_at >= date_trunc('day', timezone('utc', now()))`,
      [ip],
    );

    const used = Number(result?.rows[0]?.count ?? 0);
    if (used >= FREE_DAILY_LIMIT) throw ERRORS.rateLimit();

    await query(
      `insert into events (name, ip, payload) values ('transcribe_quota', $1, $2::jsonb)`,
      [ip, JSON.stringify({ limit: FREE_DAILY_LIMIT })],
    );
  } catch (error) {
    if (error instanceof TranscribeError) throw error;
    if (isMissingRelation(error)) {
      console.warn("[textfromvideos] events table missing; using temporary in-memory quota. Apply db/schema.sql.");
    } else {
      console.warn("[textfromvideos] durable quota check failed; using temporary in-memory fallback", error);
    }
    consumeMemoryQuota(ip);
  }
}

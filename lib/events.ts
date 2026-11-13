import { isDurableDatabaseConfigured } from "./config";
import { isMissingRelation, query, warnTemporaryStore } from "./db";

export const ANALYTICS_EVENTS = [
  "transcribe_start",
  "transcribe_success",
  "copy_click",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

type StoredEvent = {
  name: string;
  ip: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
};

const memoryEvents: StoredEvent[] = [];
const MEMORY_CAP = 1000;

/**
 * Persist a first-party analytics event.
 * Durable when DATABASE_URL (and the optional events table) is available;
 * otherwise kept in a temporary in-memory ring buffer.
 */
export async function recordEvent(input: {
  name: string;
  ip?: string | null;
  payload?: Record<string, unknown> | null;
}): Promise<void> {
  const createdAt = new Date().toISOString();

  if (!isDurableDatabaseConfigured()) {
    warnTemporaryStore("Analytics events");
    memoryEvents.push({
      name: input.name,
      ip: input.ip ?? null,
      payload: input.payload ?? null,
      createdAt,
    });
    if (memoryEvents.length > MEMORY_CAP) memoryEvents.shift();
    return;
  }

  try {
    await query(
      `insert into events (name, ip, payload) values ($1, $2, $3::jsonb)`,
      [input.name, input.ip ?? null, JSON.stringify(input.payload ?? {})],
    );
  } catch (error) {
    if (isMissingRelation(error)) {
      console.warn("[textfromvideos] events table missing; event was not persisted. Apply db/schema.sql.");
      return;
    }
    throw error;
  }
}

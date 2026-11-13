import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";
import { isDurableDatabaseConfigured } from "./config";

let pool: Pool | null = null;
let missingDbWarned = false;

export function warnTemporaryStore(scope: string): void {
  if (missingDbWarned) return;
  if (isDurableDatabaseConfigured()) return;
  missingDbWarned = true;
  console.warn(
    `[textfromvideos] DATABASE_URL is not set. ${scope} is using a TEMPORARY in-memory store. Data is lost on restart and is not shared across instances. This is not production-ready.`,
  );
}

export function getPool(): Pool | null {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 5,
      idleTimeoutMillis: 10_000,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T> | null> {
  const current = getPool();
  if (!current) return null;
  return current.query<T>(text, params);
}

export async function withClient<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T | null> {
  const current = getPool();
  if (!current) return null;
  const client = await current.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export function isMissingRelation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "42P01",
  );
}

import { isDurableDatabaseConfigured } from "./config";
import { query, warnTemporaryStore } from "./db";

export type JobStatus = "queued" | "running" | "done" | "failed";

type MemoryJob = {
  id: number;
  url: string;
  status: JobStatus;
  error: string | null;
  createdAt: Date;
  finishedAt: Date | null;
};

const memoryJobs: MemoryJob[] = [];
let memorySeq = 1;

export async function createJob(url: string): Promise<number | null> {
  if (!isDurableDatabaseConfigured()) {
    warnTemporaryStore("Jobs");
    const job: MemoryJob = {
      id: memorySeq++,
      url,
      status: "queued",
      error: null,
      createdAt: new Date(),
      finishedAt: null,
    };
    memoryJobs.push(job);
    return job.id;
  }

  const result = await query<{ id: string }>(
    `insert into jobs (url, status) values ($1, 'queued') returning id`,
    [url],
  );
  const id = result?.rows[0]?.id;
  return id ? Number(id) : null;
}

export async function updateJob(
  id: number | null,
  status: JobStatus,
  error?: string | null,
): Promise<void> {
  if (id === null) return;
  const finished = status === "done" || status === "failed";

  if (!isDurableDatabaseConfigured()) {
    const job = memoryJobs.find((item) => item.id === id);
    if (!job) return;
    job.status = status;
    job.error = error ?? null;
    job.finishedAt = finished ? new Date() : job.finishedAt;
    return;
  }

  await query(
    `update jobs
     set status = $2,
         error = $3,
         finished_at = case when $4 then now() else finished_at end
     where id = $1`,
    [id, status, error ?? null, finished],
  );
}

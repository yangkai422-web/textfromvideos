import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  FREE_MAX_DURATION_SEC,
  getFfprobePath,
  getYtDlpCookiesFile,
  getYtDlpPath,
} from "./config";
import { ERRORS, TranscribeError, isTimeoutError } from "./errors";
import { assertSafeMediaUrl } from "./platform";
import {
  type Cue,
  parseCaptionFile,
} from "./transcript-format";

export type CaptionTrack = {
  lang: string;
  ext: string;
  url?: string;
  data?: string;
  official: boolean;
};

export type MediaInspection = {
  durationSec: number | null;
  title: string | null;
  tracks: CaptionTrack[];
};

export type AudioDownload = {
  buffer: Buffer;
  mimeType: string;
  fileName: string;
  durationSec: number | null;
};

type YtDlpSub = {
  ext?: string;
  url?: string;
  data?: string;
  name?: string;
};

type YtDlpJson = {
  id?: string;
  title?: string;
  duration?: number;
  availability?: string;
  subtitles?: Record<string, YtDlpSub[]>;
  automatic_captions?: Record<string, YtDlpSub[]>;
};

function collectOutput(child: ReturnType<typeof spawn>): Promise<{
  stdout: Buffer;
  stderr: string;
  code: number | null;
}> {
  const stdoutChunks: Buffer[] = [];
  const stderrChunks: Buffer[] = [];
  child.stdout?.on("data", (chunk: Buffer) => stdoutChunks.push(chunk));
  child.stderr?.on("data", (chunk: Buffer) => stderrChunks.push(chunk));
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => {
      resolve({
        stdout: Buffer.concat(stdoutChunks),
        stderr: Buffer.concat(stderrChunks).toString("utf8"),
        code,
      });
    });
  });
}

async function runProcess(
  command: string,
  args: string[],
  signal: AbortSignal | undefined,
  cwd?: string,
): Promise<{ stdout: Buffer; stderr: string; code: number | null }> {
  if (signal?.aborted) throw ERRORS.timeout();

  const child = spawn(command, args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const onAbort = () => {
    child.kill("SIGKILL");
  };
  signal?.addEventListener("abort", onAbort, { once: true });

  try {
    const result = await collectOutput(child);
    if (signal?.aborted) throw ERRORS.timeout();
    return result;
  } catch (error) {
    if (isTimeoutError(error) || signal?.aborted) throw ERRORS.timeout();
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code === "ENOENT") {
      throw new TranscribeError(
        "The server is missing yt-dlp or ffmpeg, which are required to fetch captions and audio.",
        500,
        "internal",
      );
    }
    throw error;
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}

function classifyYtDlpError(stderr: string): TranscribeError | null {
  const text = stderr.toLowerCase();
  if (
    text.includes("private video") ||
    text.includes("this video is private") ||
    text.includes("friends only") ||
    text.includes("login required") ||
    text.includes("only available to") ||
    text.includes("account privacy")
  ) {
    return ERRORS.privateVideo();
  }
  if (
    text.includes("this content isn't available") ||
    text.includes("video is unavailable") ||
    text.includes("video unavailable") ||
    text.includes("has been removed") ||
    text.includes("does not exist") ||
    text.includes("404")
  ) {
    return ERRORS.unavailableVideo();
  }
  return null;
}

function commonYtDlpArgs(): string[] {
  const args = [
    "--no-playlist",
    "--no-warnings",
    "--no-progress",
    "--socket-timeout",
    "20",
    "--retries",
    "2",
  ];
  const cookies = getYtDlpCookiesFile();
  if (cookies) args.push("--cookies", cookies);
  return args;
}

function tracksFromMap(
  map: Record<string, YtDlpSub[]> | undefined,
  official: boolean,
): CaptionTrack[] {
  if (!map) return [];
  const tracks: CaptionTrack[] = [];
  for (const [lang, entries] of Object.entries(map)) {
    for (const entry of entries ?? []) {
      tracks.push({
        lang,
        ext: entry.ext || "vtt",
        url: entry.url,
        data: entry.data,
        official,
      });
    }
  }
  return tracks;
}

const LANG_PREF = ["en", "en-us", "en-gb", "en-orig", "en-en"];

function rankTrack(track: CaptionTrack): number {
  const lang = track.lang.toLowerCase();
  const langScore = LANG_PREF.findIndex(
    (item) => lang === item || lang.startsWith(`${item}-`) || lang.startsWith(item),
  );
  const officialScore = track.official ? 0 : 100;
  const extScore =
    track.ext.includes("json") ? 0 : track.ext.includes("vtt") ? 1 : track.ext.includes("srt") ? 2 : 3;
  return officialScore + (langScore === -1 ? 50 : langScore) * 10 + extScore;
}

function pickCaptionTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (!tracks.length) return null;
  return [...tracks].sort((a, b) => rankTrack(a) - rankTrack(b))[0] ?? null;
}

export async function inspectMedia(
  pageUrl: string,
  signal?: AbortSignal,
): Promise<MediaInspection> {
  assertSafeMediaUrl(pageUrl);
  const result = await runProcess(
    getYtDlpPath(),
    [...commonYtDlpArgs(), "--dump-json", "--skip-download", pageUrl],
    signal,
  );

  if (result.code !== 0) {
    throw classifyYtDlpError(result.stderr) ?? ERRORS.unavailableVideo();
  }

  let parsed: YtDlpJson;
  try {
    parsed = JSON.parse(result.stdout.toString("utf8")) as YtDlpJson;
  } catch {
    throw ERRORS.unavailableVideo("The video metadata could not be read.");
  }

  if (parsed.availability && /private|premium|subscriber|needs_auth/i.test(parsed.availability)) {
    throw ERRORS.privateVideo();
  }

  const tracks = [
    ...tracksFromMap(parsed.subtitles, true),
    ...tracksFromMap(parsed.automatic_captions, false),
  ];

  return {
    durationSec: typeof parsed.duration === "number" ? parsed.duration : null,
    title: parsed.title ?? null,
    tracks,
  };
}

export function assertDurationAllowed(durationSec: number | null): void {
  if (durationSec !== null && durationSec > FREE_MAX_DURATION_SEC) {
    throw ERRORS.durationLimit();
  }
}

async function fetchCaptionBody(
  track: CaptionTrack,
  signal?: AbortSignal,
): Promise<string | null> {
  if (track.data?.trim()) return track.data;
  if (!track.url) return null;
  const response = await fetch(track.url, {
    signal,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "*/*",
    },
  });
  if (!response.ok) return null;
  return response.text();
}

export async function extractPlatformCaptions(
  pageUrl: string,
  inspection: MediaInspection,
  signal?: AbortSignal,
): Promise<{ cues: Cue[]; lang: string } | null> {
  const track = pickCaptionTrack(inspection.tracks);
  if (!track) return null;

  let body = await fetchCaptionBody(track, signal);
  if (!body) {
    body = await downloadCaptionsWithYtDlp(pageUrl, track, signal);
  }
  if (!body) return null;

  const cues = parseCaptionFile(body, track.ext);
  const meaningful = cues.filter((cue) => cue.text.replace(/[♪♫\s]/g, "").length > 0);
  if (!meaningful.length) return null;

  return { cues: meaningful, lang: track.lang || "und" };
}

async function downloadCaptionsWithYtDlp(
  pageUrl: string,
  track: CaptionTrack,
  signal?: AbortSignal,
): Promise<string | null> {
  const dir = await mkdtemp(join(tmpdir(), "tfv-subs-"));
  try {
    const result = await runProcess(
      getYtDlpPath(),
      [
        ...commonYtDlpArgs(),
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs",
        track.lang || "en.*",
        "--sub-format",
        "vtt/srt/best",
        "-o",
        join(dir, "subs"),
        pageUrl,
      ],
      signal,
      dir,
    );
    if (result.code !== 0) return null;
    const files = await readdir(dir);
    const subFile = files.find((name) => /\.(vtt|srt|json3|srv3|ttml)$/i.test(name));
    if (!subFile) return null;
    return readFile(join(dir, subFile), "utf8");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function probeDuration(filePath: string, signal?: AbortSignal): Promise<number | null> {
  const result = await runProcess(
    getFfprobePath(),
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", filePath],
    signal,
  );
  if (result.code !== 0) return null;
  const value = Number(result.stdout.toString("utf8").trim());
  return Number.isFinite(value) ? value : null;
}

function audioMime(fileName: string): string {
  if (fileName.endsWith(".mp3")) return "audio/mpeg";
  if (fileName.endsWith(".m4a") || fileName.endsWith(".mp4")) return "audio/mp4";
  if (fileName.endsWith(".wav")) return "audio/wav";
  if (fileName.endsWith(".ogg") || fileName.endsWith(".opus")) return "audio/ogg";
  if (fileName.endsWith(".webm")) return "audio/webm";
  return "application/octet-stream";
}

export async function downloadAudio(
  pageUrl: string,
  signal?: AbortSignal,
): Promise<AudioDownload> {
  assertSafeMediaUrl(pageUrl);
  const dir = await mkdtemp(join(tmpdir(), "tfv-audio-"));
  try {
    const result = await runProcess(
      getYtDlpPath(),
      [
        ...commonYtDlpArgs(),
        "-f",
        "bestaudio/best",
        "-x",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "5",
        "-o",
        join(dir, "audio.%(ext)s"),
        pageUrl,
      ],
      signal,
      dir,
    );
    if (result.code !== 0) {
      throw classifyYtDlpError(result.stderr) ?? ERRORS.unavailableVideo();
    }

    const files = await readdir(dir);
    const audioFile = files.find((name) => /\.(mp3|m4a|mp4|wav|ogg|opus|webm)$/i.test(name));
    if (!audioFile) throw ERRORS.noMedia();

    const filePath = join(dir, audioFile);
    const durationSec = await probeDuration(filePath, signal);
    assertDurationAllowed(durationSec);

    const buffer = await readFile(filePath);
    if (!buffer.length) throw ERRORS.noMedia();

    return {
      buffer,
      mimeType: audioMime(audioFile.toLowerCase()),
      fileName: audioFile,
      durationSec,
    };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

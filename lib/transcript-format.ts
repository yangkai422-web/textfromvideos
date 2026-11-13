export type Cue = {
  startSec: number;
  endSec: number;
  text: string;
};

export type TranscriptPayload = {
  text: string;
  srt: string;
  vtt: string;
  lang: string;
  source: "captions" | "asr";
};

function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

function formatTimestamp(seconds: number, fractionSep: "," | "."): string {
  const clamped = Math.max(0, seconds);
  const totalMs = Math.round(clamped * 1000);
  const hours = Math.floor(totalMs / 3_600_000);
  const minutes = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1000);
  const ms = totalMs % 1000;
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)}${fractionSep}${pad(ms, 3)}`;
}

export function cuesToSrt(cues: Cue[]): string {
  return cues
    .map((cue, index) => {
      const text = cue.text.trim();
      return `${index + 1}\n${formatTimestamp(cue.startSec, ",")} --> ${formatTimestamp(cue.endSec, ",")}\n${text}`;
    })
    .join("\n\n")
    .concat(cues.length ? "\n" : "");
}

export function cuesToVtt(cues: Cue[]): string {
  const body = cues
    .map((cue) => {
      const text = cue.text.trim();
      return `${formatTimestamp(cue.startSec, ".")} --> ${formatTimestamp(cue.endSec, ".")}\n${text}`;
    })
    .join("\n\n");
  return `WEBVTT\n\n${body}${body ? "\n" : ""}`;
}

export function srtToVtt(srt: string): string {
  const cues = parseSrt(srt);
  if (cues.length) return cuesToVtt(cues);
  const stripped = srt
    .replace(/^\d+\s*$/gm, "")
    .replace(
      /(\d{2}:\d{2}:\d{2}),(\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}),(\d{3})/g,
      "$1.$2 --> $3.$4",
    )
    .trim();
  return `WEBVTT\n\n${stripped}\n`;
}

export function cuesToPlainText(cues: Cue[]): string {
  return cues
    .map((cue) => cue.text.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTimestamp(raw: string): number | null {
  const match = raw
    .trim()
    .match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$|^(\d{1,2}):(\d{2})[,.](\d{1,3})$/);
  if (!match) return null;
  if (match[1] !== undefined) {
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    const seconds = Number(match[3]);
    const ms = Number(match[4].padEnd(3, "0"));
    return hours * 3600 + minutes * 60 + seconds + ms / 1000;
  }
  const minutes = Number(match[5]);
  const seconds = Number(match[6]);
  const ms = Number(match[7].padEnd(3, "0"));
  return minutes * 60 + seconds + ms / 1000;
}

export function parseSrt(input: string): Cue[] {
  const blocks = input.replace(/^\uFEFF/, "").trim().split(/\r?\n\r?\n/);
  const cues: Cue[] = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) continue;
    const timeLine = lines[0].includes("-->") ? lines[0] : lines[1];
    if (!timeLine?.includes("-->")) continue;
    const [startRaw, endRaw] = timeLine.split("-->").map((part) => part.trim());
    const startSec = parseTimestamp(startRaw.split(/\s+/)[0]);
    const endSec = parseTimestamp(endRaw.split(/\s+/)[0]);
    if (startSec === null || endSec === null) continue;
    const textStart = lines[0].includes("-->") ? 1 : 2;
    const text = lines
      .slice(textStart)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;
    cues.push({ startSec, endSec, text });
  }
  return cues;
}

export function parseVtt(input: string): Cue[] {
  const withoutHeader = input.replace(/^\uFEFF/, "").replace(/^WEBVTT[^\n]*\n+/i, "");
  const blocks = withoutHeader
    .split(/\r?\n\r?\n/)
    .filter((block) => !/^(NOTE|STYLE|REGION)\b/i.test(block.trim()));
  const cues: Cue[] = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).filter((line) => line.trim() !== "");
    if (lines.length < 2) continue;
    const timeLine = lines[0].includes("-->") ? lines[0] : lines[1];
    if (!timeLine?.includes("-->")) continue;
    const [startRaw, endRaw] = timeLine.split("-->").map((part) => part.trim());
    const startSec = parseTimestamp(normalizeVttTime(startRaw.split(/\s+/)[0]));
    const endSec = parseTimestamp(normalizeVttTime(endRaw.split(/\s+/)[0]));
    if (startSec === null || endSec === null) continue;
    const textStart = lines[0].includes("-->") ? 1 : 2;
    const text = lines
      .slice(textStart)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;
    cues.push({ startSec, endSec, text });
  }
  return cues;
}

function normalizeVttTime(value: string): string {
  // "00:00.000" -> "00:00:00.000" is handled by the 2-part branch of parseTimestamp.
  return value;
}

type Json3Event = {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: Array<{ utf8?: string }>;
};

export function parseJson3(input: string): Cue[] {
  let parsed: { events?: Json3Event[] };
  try {
    parsed = JSON.parse(input) as { events?: Json3Event[] };
  } catch {
    return [];
  }
  const cues: Cue[] = [];
  for (const event of parsed.events ?? []) {
    const text = (event.segs ?? [])
      .map((seg) => seg.utf8 ?? "")
      .join("")
      .replace(/\s+/g, " ")
      .trim();
    if (!text || text === "\n") continue;
    const startSec = (event.tStartMs ?? 0) / 1000;
    const durationSec = (event.dDurationMs ?? 2000) / 1000;
    cues.push({
      startSec,
      endSec: startSec + Math.max(durationSec, 0.4),
      text,
    });
  }
  return cues;
}

export function parseCaptionFile(content: string, extHint?: string): Cue[] {
  const trimmed = content.trim();
  const ext = (extHint ?? "").toLowerCase();
  if (ext.includes("json") || trimmed.startsWith("{")) {
    const jsonCues = parseJson3(trimmed);
    if (jsonCues.length) return jsonCues;
  }
  if (ext.includes("vtt") || /^WEBVTT/i.test(trimmed)) {
    return parseVtt(trimmed);
  }
  if (ext.includes("srt") || /\d+\s+\d{2}:\d{2}:\d{2},\d{3}/.test(trimmed)) {
    return parseSrt(trimmed);
  }
  return parseVtt(trimmed).length ? parseVtt(trimmed) : parseSrt(trimmed);
}

export function wordsToCues(
  words: Array<{ text: string; startSec: number; endSec: number }>,
): Cue[] {
  const cues: Cue[] = [];
  let buffer: typeof words = [];

  const flush = () => {
    if (!buffer.length) return;
    const text = buffer
      .map((word) => word.text)
      .join(" ")
      .replace(/\s+([,.;!?])/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) {
      buffer = [];
      return;
    }
    cues.push({
      startSec: buffer[0].startSec,
      endSec: Math.max(buffer[buffer.length - 1].endSec, buffer[0].startSec + 0.4),
      text,
    });
    buffer = [];
  };

  for (const word of words) {
    buffer.push(word);
    const duration =
      (buffer[buffer.length - 1].endSec ?? 0) - (buffer[0].startSec ?? 0);
    if (/[.!?…]["')\]]*$/.test(word.text) || duration >= 6 || buffer.length >= 24) {
      flush();
    }
  }
  flush();
  return cues;
}

export function normalizePlainText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
}

export function buildTranscript(input: {
  lang?: string | null;
  source: "captions" | "asr";
  cues?: Cue[];
  text?: string;
  srt?: string;
}): TranscriptPayload {
  const cues =
    input.cues && input.cues.length
      ? input.cues
      : input.srt
        ? parseSrt(input.srt)
        : [];

  const text =
    normalizePlainText(input.text ?? "") ||
    cuesToPlainText(cues);

  const finalCues =
    cues.length > 0
      ? cues
      : text
        ? [{ startSec: 0, endSec: Math.max(2, Math.min(12, text.split(" ").length * 0.35)), text }]
        : [];

  const srt = input.srt?.trim() ? input.srt : cuesToSrt(finalCues);
  const vtt = srtToVtt(srt);
  const lang = (input.lang || "und").trim() || "und";

  return { text, srt, vtt, lang, source: input.source };
}

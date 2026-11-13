import { getAsrApiKey, getAsrProvider, type AsrProvider } from "./config";
import { TranscribeError } from "./errors";
import type { AudioDownload } from "./media";
import {
  type Cue,
  buildTranscript,
  type TranscriptPayload,
  wordsToCues,
} from "./transcript-format";

export type AsrWord = {
  text: string;
  startSec: number;
  endSec: number;
};

export type AsrResult = {
  text: string;
  lang: string;
  cues: Cue[];
  provider: AsrProvider;
};

function missingKeyError(provider: AsrProvider): TranscribeError {
  const envName =
    provider === "deepgram"
      ? "DEEPGRAM_API_KEY or ASR_API_KEY"
      : provider === "assemblyai"
        ? "ASSEMBLYAI_API_KEY or ASR_API_KEY"
        : "OPENAI_API_KEY or ASR_API_KEY";
  return new TranscribeError(
    `The ${provider} speech-to-text key is not configured. Set ${envName}.`,
    500,
    "internal",
  );
}

async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `${response.status} ${response.statusText}`;
  try {
    const body = (await response.json()) as {
      error?: { message?: string } | string;
      message?: string;
      detail?: string;
    };
    if (typeof body.error === "string") return body.error;
    if (body.error && typeof body.error === "object" && body.error.message) {
      return body.error.message;
    }
    return body.message || body.detail || fallback;
  } catch {
    return fallback;
  }
}

function transcribeFailed(provider: AsrProvider, detail: string): TranscribeError {
  return new TranscribeError(
    `The ${provider} transcript request failed: ${detail}`,
    502,
    "internal",
  );
}

function resultFromWords(input: {
  text: string;
  lang?: string | null;
  words?: AsrWord[];
  cues?: Cue[];
  provider: AsrProvider;
}): AsrResult {
  const cues =
    input.cues && input.cues.length
      ? input.cues
      : input.words && input.words.length
        ? wordsToCues(input.words)
        : [];
  return {
    text: input.text.trim(),
    lang: (input.lang || "und").trim() || "und",
    cues,
    provider: input.provider,
  };
}

async function transcribeDeepgram(
  audio: AudioDownload,
  signal?: AbortSignal,
): Promise<AsrResult> {
  const key = getAsrApiKey("deepgram");
  if (!key) throw missingKeyError("deepgram");

  const url = new URL("https://api.deepgram.com/v1/listen");
  url.searchParams.set("model", process.env.DEEPGRAM_MODEL?.trim() || "nova-3");
  url.searchParams.set("smart_format", "true");
  url.searchParams.set("utterances", "true");
  url.searchParams.set("detect_language", "true");
  url.searchParams.set("punctuate", "true");

  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Token ${key}`,
      "Content-Type": audio.mimeType,
    },
    body: new Uint8Array(audio.buffer),
  });

  if (!response.ok) {
    throw transcribeFailed("deepgram", await readErrorMessage(response));
  }

  const data = (await response.json()) as {
    results?: {
      channels?: Array<{
        detected_language?: string;
        alternatives?: Array<{
          transcript?: string;
          words?: Array<{ word?: string; punctuated_word?: string; start?: number; end?: number }>;
        }>;
      }>;
      utterances?: Array<{
        transcript?: string;
        start?: number;
        end?: number;
      }>;
    };
  };

  const channel = data.results?.channels?.[0];
  const alternative = channel?.alternatives?.[0];
  const text = alternative?.transcript?.trim() ?? "";
  const words: AsrWord[] = (alternative?.words ?? [])
    .filter((word) => word.start !== undefined && word.end !== undefined)
    .map((word) => ({
      text: (word.punctuated_word || word.word || "").trim(),
      startSec: word.start ?? 0,
      endSec: word.end ?? 0,
    }))
    .filter((word) => word.text);

  const cues: Cue[] = (data.results?.utterances ?? [])
    .map((utterance) => ({
      startSec: utterance.start ?? 0,
      endSec: utterance.end ?? (utterance.start ?? 0) + 1,
      text: (utterance.transcript ?? "").trim(),
    }))
    .filter((cue) => cue.text);

  return resultFromWords({
    text,
    lang: channel?.detected_language,
    words,
    cues: cues.length ? cues : undefined,
    provider: "deepgram",
  });
}

async function transcribeAssemblyAi(
  audio: AudioDownload,
  signal?: AbortSignal,
): Promise<AsrResult> {
  const key = getAsrApiKey("assemblyai");
  if (!key) throw missingKeyError("assemblyai");

  const upload = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    signal,
    headers: {
      authorization: key,
      "Content-Type": "application/octet-stream",
    },
    body: new Uint8Array(audio.buffer),
  });
  if (!upload.ok) {
    throw transcribeFailed("assemblyai", await readErrorMessage(upload));
  }
  const uploaded = (await upload.json()) as { upload_url?: string };
  if (!uploaded.upload_url) {
    throw transcribeFailed("assemblyai", "upload did not return a URL");
  }

  const created = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    signal,
    headers: {
      authorization: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: uploaded.upload_url,
      punctuate: true,
      format_text: true,
      language_detection: true,
    }),
  });
  if (!created.ok) {
    throw transcribeFailed("assemblyai", await readErrorMessage(created));
  }
  const job = (await created.json()) as { id?: string; status?: string; error?: string };
  if (!job.id) throw transcribeFailed("assemblyai", "transcript job id missing");

  while (true) {
    if (signal?.aborted) throw new TranscribeError("Processing timed out. Please try again.", 504, "timeout");
    const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${job.id}`, {
      method: "GET",
      signal,
      headers: { authorization: key },
    });
    if (!poll.ok) {
      throw transcribeFailed("assemblyai", await readErrorMessage(poll));
    }
    const status = (await poll.json()) as {
      status?: string;
      error?: string;
      text?: string;
      language_code?: string;
      words?: Array<{ text?: string; start?: number; end?: number }>;
    };
    if (status.status === "error" || status.status === "failed") {
      throw transcribeFailed("assemblyai", status.error || "transcription failed");
    }
    if (status.status === "completed") {
      const words: AsrWord[] = (status.words ?? []).map((word) => ({
        text: (word.text ?? "").trim(),
        startSec: (word.start ?? 0) / 1000,
        endSec: (word.end ?? 0) / 1000,
      })).filter((word) => word.text);
      return resultFromWords({
        text: status.text ?? "",
        lang: status.language_code,
        words,
        provider: "assemblyai",
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}

/**
 * OpenAI Whisper client. Only used when ASR_PROVIDER=openai and a key is set.
 * Ready for the later bake-off; not the default provider.
 */
async function transcribeOpenAiWhisper(
  audio: AudioDownload,
  signal?: AbortSignal,
): Promise<AsrResult> {
  const key = getAsrApiKey("openai");
  if (!key) throw missingKeyError("openai");

  const form = new FormData();
  form.set("model", process.env.OPENAI_WHISPER_MODEL?.trim() || "whisper-1");
  form.set("response_format", "verbose_json");
  form.set(
    "file",
    new Blob([new Uint8Array(audio.buffer)], { type: audio.mimeType }),
    audio.fileName || "audio.mp3",
  );
  form.set("timestamp_granularities[]", "segment");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${key}`,
    },
    body: form,
  });
  if (!response.ok) {
    throw transcribeFailed("openai", await readErrorMessage(response));
  }

  const data = (await response.json()) as {
    text?: string;
    language?: string;
    segments?: Array<{ start?: number; end?: number; text?: string }>;
  };

  const cues: Cue[] = (data.segments ?? [])
    .map((segment) => ({
      startSec: segment.start ?? 0,
      endSec: segment.end ?? (segment.start ?? 0) + 1,
      text: (segment.text ?? "").trim(),
    }))
    .filter((cue) => cue.text);

  return resultFromWords({
    text: data.text ?? "",
    lang: data.language,
    cues,
    provider: "openai",
  });
}

export async function transcribeAudio(
  audio: AudioDownload,
  signal?: AbortSignal,
  provider: AsrProvider = getAsrProvider(),
): Promise<AsrResult> {
  if (provider === "assemblyai") return transcribeAssemblyAi(audio, signal);
  if (provider === "openai") return transcribeOpenAiWhisper(audio, signal);
  return transcribeDeepgram(audio, signal);
}

export function asrToPayload(result: AsrResult): TranscriptPayload {
  return buildTranscript({
    lang: result.lang,
    source: "asr",
    cues: result.cues,
    text: result.text,
  });
}

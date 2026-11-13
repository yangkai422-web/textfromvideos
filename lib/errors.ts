export type TranscribeErrorCode =
  | "unrecognized_link"
  | "private_video"
  | "timeout"
  | "duration_limit"
  | "rate_limit"
  | "no_media"
  | "internal";

export class TranscribeError extends Error {
  readonly status: number;
  readonly code: TranscribeErrorCode;

  constructor(message: string, status: number, code: TranscribeErrorCode) {
    super(message);
    this.name = "TranscribeError";
    this.status = status;
    this.code = code;
  }
}

export const ERRORS = {
  unrecognizedLink: () =>
    new TranscribeError(
      "This link cannot be recognized. Paste a TikTok or Instagram Reels URL.",
      400,
      "unrecognized_link",
    ),
  privateVideo: () =>
    new TranscribeError(
      "This video is private.",
      403,
      "private_video",
    ),
  unavailableVideo: (detail?: string) =>
    new TranscribeError(
      detail ??
        "This video could not be reached. It may be private or deleted.",
      403,
      "private_video",
    ),
  timeout: () =>
    new TranscribeError(
      "Processing timed out. Please try again.",
      504,
      "timeout",
    ),
  durationLimit: () =>
    new TranscribeError(
      "This video is longer than 3 minutes. The free limit is 3 minutes.",
      400,
      "duration_limit",
    ),
  rateLimit: () =>
    new TranscribeError(
      "You've reached today's free limit of 3 transcripts. Please try again tomorrow.",
      429,
      "rate_limit",
    ),
  noMedia: () =>
    new TranscribeError(
      "This video has no usable audio or captions.",
      422,
      "no_media",
    ),
} as const;

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof TranscribeError && error.code === "timeout") return true;
  if (error instanceof Error && error.name === "TimeoutError") return true;
  if (error instanceof DOMException && error.name === "TimeoutError") return true;
  if (error instanceof Error && error.name === "AbortError") return true;
  return false;
}

export function toPublicError(error: unknown): TranscribeError {
  if (error instanceof TranscribeError) return error;
  if (isTimeoutError(error)) return ERRORS.timeout();
  return new TranscribeError(
    "Something went wrong while getting this transcript. Please try again.",
    500,
    "internal",
  );
}

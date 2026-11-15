"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "./track-event";
import { TranscriptResult, type TranscriptView } from "./TranscriptResult";

type ApiError = {
  error?: string;
  code?: string;
};

export function TranscriptForm() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [progress, setProgress] = useState("Getting your transcript…");
  const [result, setResult] = useState<TranscriptView | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setStatus("error");
      setError("Paste a TikTok or Instagram Reels URL first.");
      return;
    }

    setStatus("loading");
    setError(null);
    setResult(null);
    setProgress("Getting your transcript…");
    trackEvent("transcribe_start");

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 95_000);

    try {
      const response = await fetch("/api/transcribe/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
        signal: controller.signal,
      });
      const data = (await response.json()) as TranscriptView & ApiError;
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong while getting this transcript.");
      }
      setResult({
        text: data.text,
        srt: data.srt,
        vtt: data.vtt,
        lang: data.lang,
        source: data.source,
      });
      setStatus("success");
      trackEvent("transcribe_success", { source: data.source, lang: data.lang });
    } catch (cause) {
      const timedOut =
        cause instanceof DOMException && cause.name === "AbortError";
      setStatus("error");
      setError(
        timedOut
          ? "Processing timed out. Please try again."
          : cause instanceof Error
            ? cause.message
            : "Something went wrong while getting this transcript. Please try again.",
      );
    } finally {
      window.clearTimeout(timer);
    }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="space-y-3">
        <label htmlFor="video-url" className="sr-only">
          Video link
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="video-url"
            name="url"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="Paste a TikTok or Reels link"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="w-full flex-1 rounded-2xl border border-line bg-card px-4 py-3 text-base text-ink outline-none ring-accent placeholder:text-muted focus:ring-2"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-2xl bg-accent px-5 py-3 text-base font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-80 sm:min-w-44"
          >
            {status === "loading" ? "Working…" : "Get transcript"}
          </button>
        </div>
      </form>

      {status === "loading" ? (
        <p className="text-sm text-muted" role="status">
          {progress}
        </p>
      ) : null}

      {status === "error" && error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <TranscriptResult result={result} />
    </div>
  );
}

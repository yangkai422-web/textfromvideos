"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "./track-event";
import { TranscriptResult, type TranscriptView } from "./TranscriptResult";

type ApiError = {
  error?: string;
  code?: string;
};

type TranscriptFormProps = {
  placeholder?: string;
  emptyError?: string;
  inputLabel?: string;
};

export function TranscriptForm({
  placeholder = "Paste a TikTok or Reels link",
  emptyError = "Paste a TikTok or Instagram Reels URL first.",
  inputLabel = "Video link",
}: TranscriptFormProps = {}) {
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
      setError(emptyError);
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
      <div className="rounded-2xl border border-line bg-card p-4 shadow-[0_14px_34px_-12px_rgba(15,23,42,0.14)] sm:p-6">
        <form onSubmit={onSubmit} className="space-y-3">
          <label htmlFor="video-url" className="sr-only">
            {inputLabel}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="video-url"
              name="url"
              type="url"
              inputMode="url"
              autoComplete="off"
              placeholder={placeholder}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              className="min-h-[44px] w-full flex-1 rounded-xl border border-line bg-background px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="min-h-[44px] w-full rounded-xl bg-accent px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-150 hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-md focus-visible:-translate-y-[1px] focus-visible:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:translate-y-0 disabled:cursor-wait disabled:opacity-80 disabled:hover:translate-y-0 sm:w-auto sm:min-w-44"
            >
              {status === "loading" ? "Working…" : "Get transcript"}
            </button>
          </div>
        </form>

        {status === "loading" ? (
          <p className="mt-3 text-sm text-muted" role="status">
            {progress}
          </p>
        ) : null}

        {status === "error" && error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <TranscriptResult result={result} />
    </div>
  );
}

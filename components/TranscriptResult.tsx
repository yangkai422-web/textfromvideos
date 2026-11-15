"use client";

import { useState } from "react";
import { trackEvent } from "./track-event";

export type TranscriptView = {
  text: string;
  srt: string;
  vtt?: string;
  lang?: string;
  source?: "captions" | "asr";
};

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

export function TranscriptResult({
  result,
  emptyLabel = "Your transcript will appear here.",
}: {
  result: TranscriptView | null;
  emptyLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
    } catch {
      return;
    }
    setCopied(true);
    trackEvent("copy_click");
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (!result) {
    return (
      <section
        className="rounded-2xl border border-line bg-card p-5 sm:p-6"
        aria-live="polite"
      >
        <h2 className="text-sm font-medium tracking-wide text-muted uppercase">
          Transcript
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-muted">
          {emptyLabel}
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-2xl border border-line bg-card p-5 sm:p-6"
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium tracking-wide text-muted uppercase">
          Transcript
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {copied ? "Copied" : "Copy text"}
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile("transcript.txt", result.text, "text/plain;charset=utf-8")
            }
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-background"
          >
            Download TXT
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile("transcript.srt", result.srt || result.text, "application/x-subrip")
            }
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-background"
          >
            Download SRT
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile(
                "transcript.vtt",
                result.vtt || result.srt || result.text,
                "text/vtt;charset=utf-8",
              )
            }
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-background"
          >
            Download VTT
          </button>
        </div>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-ink">
        {result.text}
      </p>
    </section>
  );
}

"use client";

import type { AnalyticsEventName } from "@/lib/events";

type TrackerWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (...args: unknown[]) => void;
  plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void;
};

/**
 * Fire a first-party event and, when present, the GA4 / Plausible hooks.
 * Failures are ignored so analytics never blocks the transcript UI.
 */
export function trackEvent(
  name: AnalyticsEventName,
  payload?: Record<string, unknown>,
): void {
  const browser = window as TrackerWindow;

  try {
    browser.dataLayer = browser.dataLayer || [];
    browser.dataLayer.push({ event: name, ...payload });
    browser.gtag?.("event", name, payload ?? {});
    browser.plausible?.(name, payload ? { props: payload } : undefined);
  } catch {
    // Ignore third-party tracker errors.
  }

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, payload }),
    keepalive: true,
  }).catch(() => undefined);
}

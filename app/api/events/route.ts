import { NextRequest, NextResponse } from "next/server";
import { isAnalyticsEventName, recordEvent } from "@/lib/events";
import { getClientIp } from "@/lib/rate-limit";

/**
 * First-party event endpoint for transcribe_start, transcribe_success, and copy_click.
 *
 * Hooking later:
 * - GA4 / GTM: set NEXT_PUBLIC_GA4_MEASUREMENT_ID and the layout script will load gtag.
 *   The browser helper also pushes to window.dataLayer and calls gtag('event', name).
 * - Plausible: set NEXT_PUBLIC_PLAUSIBLE_DOMAIN and the layout script will load Plausible.
 *   The browser helper also calls window.plausible?.(name).
 * Events are also stored in the optional `events` table when DATABASE_URL is set.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name =
    typeof body === "object" && body && "name" in body && typeof body.name === "string"
      ? body.name
      : "";

  if (!isAnalyticsEventName(name)) {
    return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }

  const payload =
    typeof body === "object" && body && "payload" in body && body.payload && typeof body.payload === "object"
      ? (body.payload as Record<string, unknown>)
      : null;

  try {
    await recordEvent({
      name,
      ip: getClientIp(request.headers),
      payload,
    });
  } catch (error) {
    console.warn("[textfromvideos] failed to persist analytics event", error);
  }

  return NextResponse.json({ ok: true });
}

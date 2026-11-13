import { NextRequest, NextResponse } from "next/server";
import { TranscribeError } from "@/lib/errors";
import { getClientIp } from "@/lib/rate-limit";
import { transcribeFromUrl } from "@/lib/transcribe";

export const maxDuration = 100;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send a JSON body with a url field.", code: "unrecognized_link" },
      { status: 400 },
    );
  }

  const url = typeof body === "object" && body && "url" in body ? body.url : undefined;
  if (typeof url !== "string" || !url.trim()) {
    return NextResponse.json(
      {
        error: "This link cannot be recognized. Paste a TikTok or Instagram Reels URL.",
        code: "unrecognized_link",
      },
      { status: 400 },
    );
  }

  try {
    const result = await transcribeFromUrl(url, getClientIp(request.headers));
    return NextResponse.json({
      text: result.text,
      srt: result.srt,
      vtt: result.vtt,
      lang: result.lang,
      source: result.source,
      cached: result.cached,
    });
  } catch (error) {
    if (error instanceof TranscribeError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    return NextResponse.json(
      {
        error: "Something went wrong while getting this transcript. Please try again.",
        code: "internal",
      },
      { status: 500 },
    );
  }
}

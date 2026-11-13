import { ERRORS, TranscribeError } from "./errors";

export type Platform = "tiktok" | "instagram";

export type ParsedVideo = {
  platform: Platform;
  videoId: string;
  /** Canonical https URL after cleaning (and, for short links, after redirects). */
  canonicalUrl: string;
};

const TIKTOK_ID = /^(\d+)$/;
const INSTAGRAM_CODE = /^[A-Za-z0-9_-]+$/;

function withHttps(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeHost(hostname: string): string {
  return hostname.replace(/\.$/, "").toLowerCase();
}

function isTikTokHost(host: string): boolean {
  return host === "tiktok.com" || host.endsWith(".tiktok.com");
}

function isInstagramHost(host: string): boolean {
  return (
    host === "instagram.com" ||
    host.endsWith(".instagram.com") ||
    host === "instagr.am" ||
    host.endsWith(".instagr.am")
  );
}

function firstPathSegments(pathname: string): string[] {
  return pathname.split("/").filter(Boolean);
}

function stripHtmlSuffix(value: string): string {
  return value.replace(/\.html?$/i, "");
}

function matchTikTok(url: URL): ParsedVideo | null {
  const host = normalizeHost(url.hostname);
  if (!isTikTokHost(host)) return null;

  const parts = firstPathSegments(url.pathname);

  // /@user/video/123, /@user/photo/123
  if (parts.length >= 3 && parts[0].startsWith("@")) {
    const kind = parts[1];
    const id = stripHtmlSuffix(parts[2]);
    if ((kind === "video" || kind === "photo") && TIKTOK_ID.test(id)) {
      return {
        platform: "tiktok",
        videoId: id,
        canonicalUrl: `https://www.tiktok.com/${parts[0]}/video/${id}`,
      };
    }
  }

  // /video/123, /v/123, /embed/123, /embed/v2/123
  if (parts.length >= 2 && (parts[0] === "video" || parts[0] === "v")) {
    const id = stripHtmlSuffix(parts[1]);
    if (TIKTOK_ID.test(id)) {
      return {
        platform: "tiktok",
        videoId: id,
        canonicalUrl: `https://www.tiktok.com/video/${id}`,
      };
    }
  }

  if (parts.length >= 2 && parts[0] === "embed") {
    const id = stripHtmlSuffix(parts[1] === "v2" ? parts[2] ?? "" : parts[1]);
    if (TIKTOK_ID.test(id)) {
      return {
        platform: "tiktok",
        videoId: id,
        canonicalUrl: `https://www.tiktok.com/video/${id}`,
      };
    }
  }

  return null;
}

function matchInstagram(url: URL): ParsedVideo | null {
  const host = normalizeHost(url.hostname);
  if (!isInstagramHost(host)) return null;

  const parts = firstPathSegments(url.pathname);
  if (parts.length === 0) return null;

  // /reel/CODE, /reels/CODE, /p/CODE
  if (
    (parts[0] === "reel" || parts[0] === "reels" || parts[0] === "p") &&
    parts[1]
  ) {
    const id = stripHtmlSuffix(parts[1]);
    if (INSTAGRAM_CODE.test(id)) {
      const kind = parts[0] === "p" ? "p" : "reel";
      return {
        platform: "instagram",
        videoId: id,
        canonicalUrl: `https://www.instagram.com/${kind}/${id}/`,
      };
    }
  }

  // /username/reel/CODE or /username/p/CODE
  if (
    parts.length >= 3 &&
    (parts[1] === "reel" || parts[1] === "reels" || parts[1] === "p") &&
    parts[2]
  ) {
    const id = stripHtmlSuffix(parts[2]);
    if (INSTAGRAM_CODE.test(id)) {
      const kind = parts[1] === "p" ? "p" : "reel";
      return {
        platform: "instagram",
        videoId: id,
        canonicalUrl: `https://www.instagram.com/${kind}/${id}/`,
      };
    }
  }

  return null;
}

function parseKnownUrl(url: URL): ParsedVideo | null {
  return matchTikTok(url) ?? matchInstagram(url);
}

function isSupportedHost(url: URL): boolean {
  const host = normalizeHost(url.hostname);
  return isTikTokHost(host) || isInstagramHost(host);
}

function isShortOrShareLink(url: URL): boolean {
  const host = normalizeHost(url.hostname);
  const parts = firstPathSegments(url.pathname);
  if (isTikTokHost(host)) {
    if (host === "vm.tiktok.com" || host === "vt.tiktok.com") return true;
    if (parts[0] === "t" || parts[0] === "share") return true;
  }
  if (isInstagramHost(host)) {
    if (parts[0] === "share" || parts[0] === "s") return true;
  }
  return false;
}

async function resolveRedirects(url: URL, signal?: AbortSignal): Promise<URL> {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    signal,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  try {
    return new URL(response.url);
  } finally {
    // We only needed the final URL; don't read a large HTML body.
    await response.body?.cancel().catch(() => undefined);
  }
}

/**
 * Parse a TikTok or Instagram Reels/post URL into platform + video_id.
 * Short links (vm.tiktok.com, /t/, Instagram /share/) are resolved via redirects.
 */
export async function parseVideoUrl(
  input: string,
  signal?: AbortSignal,
): Promise<ParsedVideo> {
  const trimmed = input.trim();
  if (!trimmed) throw ERRORS.unrecognizedLink();

  let url: URL;
  try {
    url = new URL(withHttps(trimmed));
  } catch {
    throw ERRORS.unrecognizedLink();
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw ERRORS.unrecognizedLink();
  }
  if (!isSupportedHost(url)) {
    throw ERRORS.unrecognizedLink();
  }

  const direct = parseKnownUrl(url);
  if (direct) return direct;

  if (isShortOrShareLink(url)) {
    try {
      const resolved = await resolveRedirects(url, signal);
      if (!isSupportedHost(resolved)) throw ERRORS.unrecognizedLink();
      const parsed = parseKnownUrl(resolved);
      if (parsed) return parsed;
    } catch (error) {
      if (error instanceof TranscribeError) throw error;
      if (signal?.aborted) throw error;
      throw ERRORS.unrecognizedLink();
    }
  }

  throw ERRORS.unrecognizedLink();
}

export function assertSafeMediaUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw ERRORS.unrecognizedLink();
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw ERRORS.unrecognizedLink();
  }
  if (!isSupportedHost(parsed)) {
    throw ERRORS.unrecognizedLink();
  }
  return parsed;
}

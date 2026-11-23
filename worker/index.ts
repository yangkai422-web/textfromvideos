import { DurableObject } from "cloudflare:workers";

export interface Env {
  APP_CONTAINER: DurableObjectNamespace<TextFromVideosContainer>;
  DATABASE_URL?: string;
  DEEPGRAM_API_KEY?: string;
  ASSEMBLYAI_API_KEY?: string;
  OPENAI_API_KEY?: string;
  ASR_API_KEY?: string;
  ASR_PROVIDER?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  YTDLP_COOKIES_B64?: string;
}

const PORT = 8080;
const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
const READY_ATTEMPTS = 90;
const READY_DELAY_MS = 2000;

export class TextFromVideosContainer extends DurableObject<Env> {
  private starting: Promise<void> | undefined;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    const container = ctx.container;
    if (container?.running) {
      void ctx.blockConcurrencyWhile(() =>
        container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS),
      );
    }
  }

  async fetch(request: Request): Promise<Response> {
    this.starting ??= this.startAndWaitForPort().finally(() => {
      this.starting = undefined;
    });
    await this.starting;

    const incoming = new URL(request.url);
    const url = new URL(request.url);
    url.protocol = "http:";
    url.host = "container";
    const forwarded = new Request(url, request);
    forwarded.headers.delete("host");
    forwarded.headers.set("x-forwarded-host", incoming.host);
    forwarded.headers.set("x-forwarded-proto", incoming.protocol.replace(":", "") || "https");
    if (!forwarded.headers.get("x-forwarded-for")) {
      const ip = request.headers.get("cf-connecting-ip");
      if (ip) forwarded.headers.set("x-forwarded-for", ip);
    }
    return this.ctx.container!.getTcpPort(PORT).fetch(forwarded);
  }

  private async startAndWaitForPort(): Promise<void> {
    const container = this.ctx.container;
    if (!container) {
      throw new Error("Container binding is not available on this Durable Object");
    }

    const image = container.images?.base;
    if (!image) {
      throw new Error("Container image is not configured");
    }

    // durable_object policy does not auto-replace a running instance
    // when the Worker image digest changes; compare and restart.
    if (container.running) {
      const info = await container.inspect();
      if (info && info.image !== "" && info.image !== image) {
        await container.destroy();
      }
    }

    if (!container.running) {
      container.start({
        image,
        instance: "basic",
        enableInternet: true,
        env: {
          NODE_ENV: "production",
          PORT: String(PORT),
          HOSTNAME: "0.0.0.0",
          NEXT_PUBLIC_SITE_URL:
            this.env.NEXT_PUBLIC_SITE_URL || "https://textfromvideos.com",
          ASR_PROVIDER: this.env.ASR_PROVIDER || "deepgram",
          DATABASE_URL: this.env.DATABASE_URL || "",
          DEEPGRAM_API_KEY: this.env.DEEPGRAM_API_KEY || "",
          ASSEMBLYAI_API_KEY: this.env.ASSEMBLYAI_API_KEY || "",
          OPENAI_API_KEY: this.env.OPENAI_API_KEY || "",
          ASR_API_KEY: this.env.ASR_API_KEY || this.env.DEEPGRAM_API_KEY || "",
          YTDLP_COOKIES_B64: this.env.YTDLP_COOKIES_B64 || "",
          YTDLP_COOKIES_FILE: "/tmp/tiktok-cookies.txt",
        },
      });
    }

    await container.setInactivityTimeout(INACTIVITY_TIMEOUT_MS);

    const port = container.getTcpPort(PORT);
    let lastError: unknown;
    for (let attempt = 0; attempt < READY_ATTEMPTS; attempt++) {
      try {
        const response = await port.fetch("http://container/health/", {
          signal: AbortSignal.timeout(2000),
        });
        await response.body?.cancel();
        if (response.ok) return;
        lastError = new Error(`Health check returned ${response.status}`);
      } catch (error) {
        lastError = error;
      }
      await scheduler.wait(READY_DELAY_MS);
    }
    throw new Error("Container did not become ready on port 8080", {
      cause: lastError,
    });
  }
}

const CACHE_VERSION = "2026-11-23-v2";
const STATIC_CACHE_CONTROL = "public, max-age=31536000, immutable";
const PAGE_CACHE_CONTROL =
  "public, max-age=600, s-maxage=86400, stale-while-revalidate=604800";

function isCacheablePath(pathname: string): boolean {
  if (pathname === "/api" || pathname.startsWith("/api/")) return false;
  if (pathname === "/health" || pathname.startsWith("/health/")) return false;
  return true;
}

function isNextRscRequest(request: Request): boolean {
  return (
    request.headers.has("rsc") ||
    request.headers.has("next-router-prefetch") ||
    request.headers.has("next-router-state-tree") ||
    request.headers.has("next-action")
  );
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const isGetOrHead = request.method === "GET" || request.method === "HEAD";

    if (
      !isGetOrHead ||
      !isCacheablePath(url.pathname) ||
      isNextRscRequest(request)
    ) {
      return env.APP_CONTAINER.getByName("app").fetch(request);
    }

    const cache = caches.default;
    const cacheUrl = new URL(url.origin + url.pathname);
    cacheUrl.searchParams.set("__cv", CACHE_VERSION);
    const cacheKey = new Request(cacheUrl.toString(), { method: "GET" });

    const cached = await cache.match(cacheKey);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set("X-Worker-Cache", "HIT");
      return new Response(request.method === "HEAD" ? null : cached.body, {
        status: cached.status,
        statusText: cached.statusText,
        headers,
      });
    }

    const upstream = await env.APP_CONTAINER.getByName("app").fetch(request);
    if (upstream.status !== 200 || upstream.headers.has("set-cookie")) {
      return upstream;
    }

    const isImmutableStatic = url.pathname.startsWith("/_next/static/");
    const cacheHeaders = new Headers(upstream.headers);
    cacheHeaders.set(
      "Cache-Control",
      isImmutableStatic ? STATIC_CACHE_CONTROL : PAGE_CACHE_CONTROL,
    );
    cacheHeaders.set("Vary", "Accept-Encoding");
    cacheHeaders.delete("pragma");
    cacheHeaders.delete("expires");

    if (request.method === "GET") {
      const [clientBody, cacheBody] = upstream.body
        ? upstream.body.tee()
        : [null, null];

      const toCache = new Response(cacheBody, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: cacheHeaders,
      });
      ctx.waitUntil(cache.put(cacheKey, toCache));

      const clientHeaders = new Headers(cacheHeaders);
      clientHeaders.set("X-Worker-Cache", "MISS");
      return new Response(clientBody, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: clientHeaders,
      });
    }

    const headHeaders = new Headers(cacheHeaders);
    headHeaders.set("X-Worker-Cache", "MISS");
    return new Response(null, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: headHeaders,
    });
  },
};

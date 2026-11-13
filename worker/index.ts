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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.APP_CONTAINER.getByName("app").fetch(request);
  },
};

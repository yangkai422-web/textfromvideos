# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
RUN corepack enable
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SITE_URL=https://textfromvideos.com
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_SITE_URL=https://textfromvideos.com

# Install ffmpeg, ffprobe, python, and yt-dlp. Use HTTP first so apt can
# install ca-certificates, then keep the packages we need.
RUN set -eux; \
  apt-get update; \
  apt-get install -y --no-install-recommends ffmpeg python3 python3-pip ca-certificates curl; \
  python3 -m pip install --break-system-packages -U "yt-dlp[default]" curl_cffi; \
  rm -rf /var/lib/apt/lists/*; \
  yt-dlp --version; \
  ffmpeg -version | head -n 1; \
  ffprobe -version | head -n 1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY scripts/container-entrypoint.sh /app/container-entrypoint.sh
RUN sed -i 's/\r$//' /app/container-entrypoint.sh && chmod 755 /app/container-entrypoint.sh

EXPOSE 8080
USER node
ENTRYPOINT ["/app/container-entrypoint.sh"]

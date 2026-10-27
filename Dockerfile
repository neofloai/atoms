# syntax=docker/dockerfile:1

# Multi-stage build for the Neoflo Atoms docs site + MCP endpoint.
# Produces a small, non-root production image from Next.js standalone
# output. Override the Node version with --build-arg NODE_VERSION=...
ARG NODE_VERSION=22

# Base image shared by every stage so the toolchain stays identical.
FROM node:${NODE_VERSION}-alpine AS base
# libc6-compat lets the prebuilt Next.js/SWC binaries run on Alpine musl.
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies in isolation so the layer caches on lockfile
# changes only, not on every source edit.
# --ignore-scripts: source is not present in this layer yet, so the
# `prepare` lifecycle (which runs the tsup library build) must not fire
# here. The library is not needed to build the docs site anyway.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Build the app. `npm run build` runs the `prebuild` hook first, which
# regenerates data/*.json, so the MCP manifests can never go stale.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Minimal runtime image: standalone server, static assets, and the
# generated data/ directory (read at runtime via fs, so it is not traced
# into the standalone bundle and must be copied explicitly).
FROM base AS runner
ENV NODE_ENV=production
# Build provenance surfaced by /api/health. CI passes the commit SHA or
# release tag; defaults to "dev" for local builds.
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone output emits server.js at the app root.
CMD ["node", "server.js"]

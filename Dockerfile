# syntax=docker/dockerfile:1

# == STAGE 1: Build ==
FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# SvelteKit validates runtime environment variables while building. These
# placeholders are used only during this layer and are not part of the image.
RUN DATABASE_URL=file:local.db \
  BETTER_AUTH_URL=http://localhost:3000 \
  BETTER_AUTH_SECRET=docker-build-placeholder-secret-min-32-chars \
  pnpm run build \
  && find build -name '*.map' -delete

# == STAGE 2: Production deps ==
FROM node:24-alpine AS deps

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# == STAGE 3: Runtime ==
FROM node:24-alpine AS runner

ENV NODE_ENV=production
WORKDIR /app

# SQLite lives on the named volume at /app/data; seed ownership so `USER node` can write
RUN mkdir -p /app/data && chown node:node /app/data

COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000

USER node

ENV TZ=America/Toronto
VOLUME /app/data

# Docker sends SIGTERM to whatever is PID 1.
#   Without exec: PID 1 is sh. The shell usually does not pass that on to Node. Docker waits, then kills the container.
#   With exec: the shell is gone, so Node is PID 1. Docker’s SIGTERM lands on Node. Node shuts down and exits; Docker sees the
#   container stop.
CMD ["sh", "-c", "node build/scripts/migrate.js && exec node build/index.js"]

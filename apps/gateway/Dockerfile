FROM oven/bun:1-alpine AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/gateway/package.json ./apps/gateway/package.json

RUN bun install
COPY apps/gateway ./apps/gateway

WORKDIR /app/apps/gateway

EXPOSE 3000
CMD ["sh", "-c", "bun src/index.ts"]
FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY prisma ./prisma
COPY prisma.config.ts ./

COPY src ./src

EXPOSE 3006

ENV XDG_CACHE_HOME=/app/.cache

CMD ["sh", "-c", "bunx prisma generate && bunx prisma migrate deploy && bun src/index.ts"]
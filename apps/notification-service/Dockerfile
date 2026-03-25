FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install


COPY prisma ./prisma
COPY prisma.config.ts ./

COPY src ./src

EXPOSE 3005
CMD ["sh", "-c", "bunx prisma generate && bunx prisma migrate deploy && bun src/index.ts"]
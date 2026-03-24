FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY prisma ./prisma
COPY prisma.config.ts ./
# ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
# RUN bunx prisma generate

COPY src ./src

EXPOSE 3003
CMD ["sh", "-c", "bunx prisma generate && bunx prisma migrate deploy && bun src/index.ts"]
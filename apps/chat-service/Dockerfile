FROM oven/bun:1-alpine AS base

WORKDIR /app

# 1. Copy root deps (monorepo)
COPY package.json bun.lock ./

# 2. Copy service package.json
COPY apps/chat-service/package.json ./apps/chat-service/package.json

# 3. Install dependencies
RUN bun install

# 4. Copy full service code
COPY apps/chat-service ./apps/chat-service

# 5. Move into service directory
WORKDIR /app/apps/chat-service

# 6. Copy prisma (IMPORTANT - correct path)
COPY apps/chat-service/prisma ./prisma

# 7. Generate prisma client
RUN bunx prisma generate

# 8. Expose port
EXPOSE 3003

# 9. Run migrations + start server
CMD ["sh", "-c", "bunx prisma migrate deploy && bun src/index.ts"]
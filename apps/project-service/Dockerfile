FROM oven/bun:1-alpine AS base

WORKDIR /app

# 1. Copy root deps (monorepo)
COPY package.json bun.lock ./

# 2. Copy service package.json
COPY apps/project-service/package.json ./apps/project-service/package.json

# 3. Install dependencies
RUN bun install

# 4. Copy full service code
COPY apps/project-service ./apps/project-service

# 5. Move into service directory
WORKDIR /app/apps/project-service

# 6. Copy prisma (IMPORTANT - correct path)
COPY apps/project-service/prisma ./prisma

# 7. Generate prisma client
RUN bunx prisma generate

# 8. Expose port
EXPOSE 3002

# 9. Run migrations + start server
CMD ["sh", "-c", "bunx prisma migrate deploy && bun src/index.ts"]
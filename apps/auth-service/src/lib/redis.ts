import Redis from "ioredis"

export const publisher = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
)

publisher.on("connect", () =>
  console.log("auth-service: redis connected")
)
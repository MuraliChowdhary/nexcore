import Redis from "ioredis"

export const subscriber = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
)

export const publisher = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
)

subscriber.on("connect", () =>
  console.log("matching-service: redis subscriber connected")
)
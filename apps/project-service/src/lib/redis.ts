import Redis from "ioredis"

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

redis.on("connect", () => console.log("project-service: redis connected"))
redis.on("error", (err) => console.error("project-service: redis error", err))
import {Redis} from "ioredis"

// subscriber — dedicated connection for pub/sub
export const subscriber = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
)

// publisher — for future use
export const publisher = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
)

subscriber.on("connect", () =>
  console.log("notification-service: redis subscriber connected")
)
publisher.on("connect", () =>
  console.log("notification-service: redis publisher connected")
)
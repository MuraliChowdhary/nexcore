import Redis from "ioredis"

// publisher — for sending events out
export const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

// subscriber — separate connection, required by Redis pub/sub
export const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

publisher.on("connect", () => console.log("chat-service: redis publisher connected"))
subscriber.on("connect", () => console.log("chat-service: redis subscriber connected"))
import type { Redis } from "ioredis"
import { upsertUserVector } from "../services/matching.service"

const CHANNELS = ["user:updated", "user:registered"]

export const startEventSubscriber = (subscriber: Redis) => {
  subscriber.subscribe(...CHANNELS, (err, count) => {
    if (err) {
      console.error("matching-service: subscribe error", err)
      return
    }
    console.log(`matching-service: subscribed to ${count} channels`)
  })

  subscriber.on("message", async (channel, message) => {
    try {
      const data = JSON.parse(message)
      await handleEvent(channel, data)
    } catch (err) {
      console.error(`[event.subscriber] error on ${channel}:`, err)
    }
  })
}

const handleEvent = async (
  channel: string,
  data: Record<string, any>
) => {
  switch (channel) {
    case "user:registered":
    case "user:updated": {
      if (!data.skills || data.skills.length === 0) return

      await upsertUserVector(
        data.userId,
        data.userName,
        data.skills
      )
      break
    }

    default:
      break
  }
}
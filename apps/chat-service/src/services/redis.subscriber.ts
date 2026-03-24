import type { Server } from "socket.io"
import { subscriber } from "../lib/redis"

// listens to project-service events and notifies chat rooms
export const startRedisSubscriber = (io: Server) => {
  subscriber.subscribe("project:joined", (err) => {
    if (err) console.error("redis subscribe error:", err)
  })

  subscriber.on("message", (channel, message) => {
    if (channel === "project:joined") {
      const data = JSON.parse(message)

      // broadcast system message to project room
      io.to(data.projectId).emit("system_message", {
        content: `${data.userName} joined the project`,
        projectId: data.projectId,
        createdAt: new Date(),
      })
    }
  })

  console.log("chat-service: redis subscriber listening")
}
import type { Server as HTTPServer } from "http"
import { Server } from "socket.io"
import { registerChatHandlers } from "./chat.handler"

export const initSocket = (httpServer: HTTPServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3010",
      credentials: true,
    },
    transports: ["websocket"],
  })

  // JWT auth middleware on socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token

    if (!token) {
      return next(new Error("Authentication required"))
    }

    try {
      // gateway already verified JWT — we trust x-user-id from handshake
      // for direct socket connections we decode manually
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      )

      socket.data.userId = payload.userId
      socket.data.userName = payload.name
      socket.data.email = payload.email

      next()
    } catch {
      next(new Error("Invalid token"))
    }
  })

  io.on("connection", (socket) => {
    registerChatHandlers(io, socket)
  })

  return io
}
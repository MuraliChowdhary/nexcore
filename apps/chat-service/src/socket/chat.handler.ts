import type { Server, Socket } from "socket.io"
import { prisma } from "../lib/index"
import { publisher } from "../lib/redis"

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId
  const userName = socket.data.userName

  console.log(`[socket] user connected: ${userName} (${userId})`)

  // join a project room
  socket.on("join_room", async (projectId: string) => {
    socket.join(projectId)
    console.log(`[socket] ${userName} joined room: ${projectId}`)

    // load last 50 messages from DB
    const messages = await prisma.message.findMany({
      where: { roomId: projectId },
      orderBy: { createdAt: "asc" },
      take: 50,
    })

    // send history only to this socket
    socket.emit("message_history", messages)

    // notify room someone joined
    socket.to(projectId).emit("user_joined", {
      userId,
      userName,
      projectId,
    })
  })

  // send a message
  socket.on("send_message", async (data: { roomId: string; content: string }) => {
    const { roomId, content } = data

    if (!content?.trim()) return

    // save to DB
    const message = await prisma.message.create({
      data: {
        roomId,
        senderId: userId,
        senderName: userName,
        content: content.trim(),
      },
    })

    // broadcast to everyone in room including sender
    io.to(roomId).emit("new_message", message)

    // publish to redis — for future scaling to multiple instances
    await publisher.publish(
      "chat:message",
      JSON.stringify(message)
    )
  })

  // leave room
  socket.on("leave_room", (projectId: string) => {
    socket.leave(projectId)
    console.log(`[socket] ${userName} left room: ${projectId}`)
  })

  // disconnect
  socket.on("disconnect", () => {
    console.log(`[socket] user disconnected: ${userName} (${userId})`)
  })
}
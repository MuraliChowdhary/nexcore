import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem("token")
    socket = io("http://localhost:3003", {
      auth: { token },
      transports: ["websocket"],
      autoConnect: false,
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
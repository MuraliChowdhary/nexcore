import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

// export const getSocket = (): Socket => {
//   if (!socket) {
//     const token = localStorage.getItem("token")
//     socket = io(
//       process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3003",
//       {
//         auth: { token },
//         transports: ["websocket"],
//         autoConnect: false,
//       }
//     )
//   }
//   return socket
// }

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem("token")

    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3003",
      {
        auth: { token },
        transports: ["websocket"],
        autoConnect: false,
      }
    )


    // ✅ expose for debugging (ONLY for dev)
    if (typeof window !== "undefined") {
      ;(window as any).socket = socket
    }
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
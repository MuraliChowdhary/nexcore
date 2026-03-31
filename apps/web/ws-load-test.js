import { io } from "socket.io-client"

const URL = "http://localhost:3003" // your socket server
const TOTAL_CLIENTS = 200
const ROOM_ID = "b557d32d-8095-48af-a273-dca048280b92"

const clients = []
let connected = 0
let messagesSent = 0
let latencies = []

function createClient(i) {
  const socket = io(URL, {
    transports: ["websocket"],
    auth: {
      token: generateFakeJWT(i) // we fake users
    }
  })

  socket.on("connect", () => {
    connected++
    socket.emit("join_room", ROOM_ID)

    if (connected === TOTAL_CLIENTS) {
      console.log("✅ All clients connected")
      startMessaging()
    }
  })

  socket.on("new_message", () => {
    const now = Date.now()
    if (socket._startTime) {
      latencies.push(now - socket._startTime)
    }
  })

  clients.push(socket)
}

function startMessaging() {
  console.log("🚀 Starting message burst...")

  const interval = setInterval(() => {
    clients.forEach((socket) => {
      socket._startTime = Date.now()

      socket.emit("send_message", {
        roomId: ROOM_ID,
        content: "hello"
      })

      messagesSent++
    })
  }, 1000)

  setTimeout(() => {
    clearInterval(interval)
    printResults()
    process.exit(0)
  }, 10000)
}

function printResults() {
  const avg =
    latencies.reduce((a, b) => a + b, 0) / latencies.length

  console.log("\n📊 RESULTS:")
  console.log("Clients:", TOTAL_CLIENTS)
  console.log("Messages sent:", messagesSent)
  console.log("Avg latency:", avg.toFixed(2), "ms")
  console.log("Min:", Math.min(...latencies))
  console.log("Max:", Math.max(...latencies))
}

function generateFakeJWT(i) {
  const payload = Buffer.from(
    JSON.stringify({
      userId: `user-${i}`,
      name: `User${i}`,
      email: `user${i}@test.com`
    })
  ).toString("base64")

  return `fake.${payload}.sig`
}

// create clients gradually (avoid crash)
let i = 0
const interval = setInterval(() => {
  createClient(i++)
  if (i >= TOTAL_CLIENTS) clearInterval(interval)
}, 5)
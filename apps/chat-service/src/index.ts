import express from "express"
import { createServer } from "http"
import { initSocket } from "./socket"
import { startRedisSubscriber } from "./services/redis.subscriber"
import messageRoutes from "./routes/message.route"

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 3003

app.use(express.json())

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "chat-service" })
})

app.use("/messages", messageRoutes)

// init socket.io on the same http server
const io = initSocket(httpServer)

// start redis subscriber — listens to project events
startRedisSubscriber(io)

httpServer.listen(PORT, () => {
  console.log(`chat-service running on port ${PORT}`)
})
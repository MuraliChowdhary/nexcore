import express from "express"
import notificationRoutes from "./routes/notification.route.js"
import { subscriber } from "./lib/redis.js"
import { startEventSubscriber } from "./subscribers/event.subscriber.js"

const app = express()
const PORT = process.env.PORT || 3005

app.use(express.json())

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "notification-service" })
})

app.use("/", notificationRoutes)

// start listening to redis events
startEventSubscriber(subscriber)

app.listen(PORT, () => {
  console.log(`notification-service running on port ${PORT}`)
})
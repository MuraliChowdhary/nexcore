import express from "express"
import matchingRoutes from "./routes/matching.route"
import { subscriber } from "./lib/redis"
import { startEventSubscriber } from "./subscribers/event.subscriber"

const app = express()
const PORT = process.env.PORT || 3006

app.use(express.json())

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "matching-service" })
})

app.use("/", matchingRoutes)

startEventSubscriber(subscriber)

app.listen(PORT, () => {
  console.log(`matching-service running on port ${PORT}`)
})
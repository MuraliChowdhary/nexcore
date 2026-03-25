import express from "express"
import taskRoutes from "./routes/task.route.js"

const app = express()
const PORT = process.env.PORT || 3004

app.use(express.json())

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "task-service" })
})

app.use("/", taskRoutes)

app.listen(PORT, () => {
  console.log(`task-service running on port ${PORT}`)
})
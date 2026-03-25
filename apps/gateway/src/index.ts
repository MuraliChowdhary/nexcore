import express from "express"
import cors from "cors"
import authRoutes from "./routes/auth.route"
import projectRoutes from "./routes/projects.route"
import messageRoutes from "./routes/messages.route"
import { rateLimit } from "./middleware/rateLimit"
import taskRoutes from "./routes/tasks.route"
import notificationRoutes from "./routes/notifications.route"

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3010",
  credentials: true,
}))

app.use(express.json())
app.use(rateLimit)

// health — shows all service URLs
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    service: "gateway",
    routes: {
      auth: process.env.AUTH_SERVICE_URL,
      projects: process.env.PROJECT_SERVICE_URL,
      chat: process.env.CHAT_SERVICE_URL,
    },
  })
})

// routes
app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/notifications", notificationRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  })
})

app.listen(PORT, () => {
  console.log(`gateway running on port ${PORT}`)
})
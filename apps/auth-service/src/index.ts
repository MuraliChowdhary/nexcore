import express from "express"
import authRoutes from "./routes/auth.route"

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

// health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "auth-service" })
})

// routes
app.use("/", authRoutes)

app.listen(PORT, () => {
  console.log(`auth-service running on port ${PORT}`)
})
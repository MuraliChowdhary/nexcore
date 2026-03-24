import express from "express"
import projectRoutes from "./routes/project.route"

const app = express()
const PORT = process.env.PORT || 3002

app.use(express.json())

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "project-service" })
})

app.use("/", projectRoutes)

app.listen(PORT, () => {
  console.log(`project-service running on port ${PORT}`)
})
import { Router } from "express"
import { prisma } from "../lib/index"

const router:Router = Router()

// GET /messages/:roomId — fetch message history via REST
router.get("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params
    const limit = Number(req.query.limit) || 50

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      take: limit,
    })

    return res.status(200).json({ success: true, data: { messages } })
  } catch (error) {
    console.error("[getMessages]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
})

export default router
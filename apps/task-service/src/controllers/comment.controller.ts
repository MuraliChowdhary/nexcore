import type { Request, Response } from "express"
import { createCommentSchema } from "../validators/task.validator.js"
import { prisma } from "../lib/prisma.js"

export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const userName = req.headers["x-user-name"] as string
    const { taskId } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const parsed = createCommentSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    if(!taskId || typeof taskId !== "string") {
      return res.status(400).json({
        success: false,
        error: "Task ID is required",
      })
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        taskId,
        authorId: userId,
        authorName: userName,
      },
    })

    return res.status(201).json({ success: true, data: { comment } })
  } catch (error) {
    console.error("[addComment]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getComments = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params


        if(!taskId || typeof taskId !== "string") {
        return res.status(400).json({
            success: false,
            error: "Task ID is required",
        })
    }
    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    })
    return res.status(200).json({ success: true, data: { comments } })
  } catch (error) {
    console.error("[getComments]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
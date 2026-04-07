import type { Request, Response } from "express"
import {
  findMatchingUsers,
  upsertUserVector,
} from "../services/matching.service"

// GET /match?q=React+developer&limit=10
export const findMatches = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string
    const limit = Number(req.query.limit) || 10

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'q' is required",
      })
    }

    const matches = await findMatchingUsers(query, limit)

    return res.status(200).json({
      success: true,
      data: {
        query,
        count: matches.length,
        matches,
      },
    })
  } catch (error) {
    console.error("[findMatches]", error)
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
}

// POST /index — manually index a user (for backfill / testing)
export const indexUser = async (req: Request, res: Response) => {
  try {
    const { userId, userName, skills } = req.body

    if (!userId || !skills || skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: "userId and skills are required",
      })
    }

    const result = await upsertUserVector(userId, userName, skills)

    return res.status(200).json({
      success: true,
      data: { result },
    })
  } catch (error) {
    console.error("[indexUser]", error)
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    })
  }
}
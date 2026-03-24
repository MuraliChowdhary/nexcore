import type { Request, Response, NextFunction } from "express"

const requestCounts = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS = 60 * 1000  // 1 minute
const MAX_REQUESTS = 100      // per IP per minute

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "unknown"
  const now = Date.now()

  const record = requestCounts.get(ip)

  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return next()
  }

  if (record.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: "Too many requests, slow down",
    })
  }

  record.count++
  next()
}
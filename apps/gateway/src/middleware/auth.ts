import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

export interface JWTPayload {
  userId: string
  email: string
  name: string,
  role?:string
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader?.split(" ")[1] // Bearer <token>
  console.log("Verifying token:", token)

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" })
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload

    // forward user context to downstream services via headers
    req.headers["x-user-id"] = payload.userId
    req.headers["x-user-name"] = payload.name
    req.headers["x-user-email"] = payload.email

    next()
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token" })
  }
}
import type { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { prisma } from "../lib/index"
import { signToken } from "../lib/jwt"
import { registerSchema, loginSchema } from "../validators/auth.validator"

export const register = async (req: Request, res: Response) => {
  try {
    console.log("[register] request body:", req.body)
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    const { name, email, password, bio, skills } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Email already registered",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, 
        bio : bio ?? null, skills },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    const token = signToken({ userId: user.id, email: user.email, name: user.name })

    return res.status(201).json({
      success: true,
      data: { user, token },
    })
  } catch (error) {
    console.error("[register]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      })
    }

    const token = signToken({ userId: user.id, email: user.email, name: user.name })

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          bio: user.bio,
          skills: user.skills,
          avatarUrl: user.avatarUrl,
        },
        token,
      },
    })
  } catch (error) {
    console.error("[login]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" })
    }

    return res.status(200).json({ success: true, data: { user } })
  } catch (error) {
    console.error("[getProfile]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
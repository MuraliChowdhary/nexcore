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

    const token = signToken({ userId: user.id, email: user.email, name: user.name, role: "OWNER" })

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


export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const { name, bio, skills, avatarUrl } = req.body

    // Build only the fields that were actually sent
    const data: Record<string, unknown> = {}
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: "Name must be at least 2 characters." })
      }
      data.name = name.trim()
    }
    if (bio !== undefined) data.bio = typeof bio === "string" ? bio.trim() : null
    if (skills !== undefined) {
      if (!Array.isArray(skills)) {
        return res.status(400).json({ success: false, message: "Skills must be an array." })
      }
      data.skills = skills.map((s: unknown) => String(s).trim()).filter(Boolean)
    }
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: "No fields provided to update." })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
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

    return res.status(200).json({
      success: true,
      message: "Profile updated.",
      data: { user: updated },
    })
  } catch (err) {
    console.error("[updateProfile]", err)
    return res.status(500).json({ success: false, message: "Internal server error." })
  }
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new password are required." })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters." })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." })
    }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

    return res.status(200).json({ success: true, message: "Password updated." })
  } catch (err) {
    console.error("[changePassword]", err)
    return res.status(500).json({ success: false, message: "Internal server error." })
  }
}


export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    await prisma.user.delete({ where: { id: userId } })
    return res.status(200).json({ success: true, message: "Account deleted." })
  } catch (err) {
    console.error("[deleteAccount]", err)
    return res.status(500).json({ success: false, message: "Internal server error." })
  }
}


export const  allusers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      // where: { visibility: "PUBLIC" },
      select: {
        id: true,
        name: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    return res.status(200).json({ success: true, data: { users } })
  } catch (error) {
    console.error("[allusers]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
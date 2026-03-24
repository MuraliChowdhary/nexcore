import type { Request, Response } from "express"
import { prisma } from "../lib/index"
import { redis } from "../lib/redis"
import { createProjectSchema } from "../validators/project.validator"

// GET /projects — all projects for discovery feed
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        members: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return res.status(200).json({ success: true, data: { projects } })
  } catch (error) {
    console.error("[getAllProjects]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// GET /projects/:id — single project with members
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    if(!id) {
        return res.status(400).json({ success: false, error: "Project ID is required" })
        }

    const project = await prisma.project.findUnique({
      where: { id},
      include: { members: true },
    })

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" })
    }

    return res.status(200).json({ success: true, data: { project } })
  } catch (error) {
    console.error("[getProjectById]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// POST /projects — create project
export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const userName = req.headers["x-user-name"] as string

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const parsed = createProjectSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    const { title, description, techStack, rolesNeeded } = parsed.data

    const project = await prisma.project.create({
      data: {
        title,
        description,
        techStack,
        rolesNeeded,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
      include: { members: true },
    })

    // publish event to redis — chat-service will create a room
    await redis.publish(
      "project:created",
      JSON.stringify({
        projectId: project.id,
        ownerId: userId,
        ownerName: userName,
        title: project.title,
      })
    )

    return res.status(201).json({ success: true, data: { project } })
  } catch (error) {
    console.error("[createProject]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// POST /projects/:id/join — join a project
export const joinProject = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const userName = req.headers["x-user-name"] as string
    const { id: projectId } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found" })
    }

    // check already a member
    const existing = await prisma.member.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    })

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "Already a member of this project",
      })
    }

    const member = await prisma.member.create({
      data: { userId, projectId, role: "collaborator" },
    })

    // publish event — chat-service listens to notify room
    await redis.publish(
      "project:joined",
      JSON.stringify({
        projectId,
        userId,
        userName,
        projectTitle: project.title,
      })
    )

    return res.status(201).json({ success: true, data: { member } })
  } catch (error) {
    console.error("[joinProject]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// GET /projects/user/mine — projects the user owns or is member of
export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: { members: true },
      orderBy: { createdAt: "desc" },
    })

    return res.status(200).json({ success: true, data: { projects } })
  } catch (error) {
    console.error("[getMyProjects]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
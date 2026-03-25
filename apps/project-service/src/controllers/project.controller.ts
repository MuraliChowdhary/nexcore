import type { Request, Response } from "express"
import * as projectService from "../services/project.service"
import {
  createProjectSchema,
  updateProjectSchema,
  inviteUserSchema,
  respondInviteSchema,
} from "../validators/project.validator"

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projects = await projectService.getAllProjects()
    return res.status(200).json({ success: true, data: { projects } })
  } catch (error) {
    console.error("[getAllProjects]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const projectId = req.params.id as string

    if (!projectId) {
      return res.status(400).json({ success: false, error: "Project ID is required" })
    }

    const result = await projectService.getProjectById(projectId, userId)

    if (!result) {
      return res.status(404).json({ success: false, error: "Project not found" })
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ success: false, error: "This is a private project" })
    }

    return res.status(200).json({ success: true, data: { project: result } })
  } catch (error) {
    console.error("[getProjectById]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

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

    const project = await projectService.createProject(
      parsed.data,
      userId,
      userName
    )
    return res.status(201).json({ success: true, data: { project } })
  } catch (error) {
    console.error("[createProject]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const updateProject = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const projectId = req.params.id as string

    if (!projectId) {
      return res.status(400).json({ success: false, error: "Project ID is required" })
    }

    const parsed = updateProjectSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    const result = await projectService.updateProject(
      projectId,
      parsed.data,
      userId
    )

    if (result === "NOT_FOUND") {
      return res.status(404).json({ success: false, error: "Project not found" })
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ success: false, error: "Only the owner can update this project" })
    }

    return res.status(200).json({ success: true, data: { project: result } })
  } catch (error) {
    console.error("[updateProject]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const joinProject = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const userName = req.headers["x-user-name"] as string
    const projectId = req.params.id as string

    if (!projectId) {
      return res.status(400).json({ success: false, error: "Project ID is required" })
    }

    const result = await projectService.joinProject(
      projectId,
      userId,
      userName
    )

    if (result === "NOT_FOUND") {
      return res.status(404).json({ success: false, error: "Project not found" })
    }
    if (result === "PRIVATE") {
      return res.status(403).json({
        success: false,
        error: "This is a private project. You need an invite to join.",
      })
    }
    if (result === "ALREADY_MEMBER") {
      return res.status(409).json({ success: false, error: "Already a member" })
    }

    return res.status(201).json({ success: true, data: { member: result } })
  } catch (error) {
    console.error("[joinProject]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getMyProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const projects = await projectService.getMyProjects(userId)
    return res.status(200).json({ success: true, data: { projects } })
  } catch (error) {
    console.error("[getMyProjects]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── Invite Controllers ───────────────────────────────────

export const inviteUser = async (req: Request, res: Response) => {
  try {
    const inviterId = req.headers["x-user-id"] as string
    const inviterName = req.headers["x-user-name"] as string
    const projectId = req.params.id as string

    if (!projectId) {
      return res.status(400).json({ success: false, error: "Project ID is required" })
    }

    const parsed = inviteUserSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    const result = await projectService.inviteUser(
      projectId,
      parsed.data,
      inviterId,
      inviterName
    )

    if (result === "NOT_FOUND") {
      return res.status(404).json({ success: false, error: "Project not found" })
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ success: false, error: "Only the owner can send invites" })
    }
    if (result === "ALREADY_MEMBER") {
      return res.status(409).json({ success: false, error: "User is already a member" })
    }
    if (result === "ALREADY_INVITED") {
      return res.status(409).json({ success: false, error: "User already has a pending invite" })
    }

    return res.status(201).json({ success: true, data: { invite: result } })
  } catch (error) {
    console.error("[inviteUser]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const respondToInvite = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string

    const parsed = respondInviteSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    const inviteId = req.params.inviteId
    if (!inviteId || typeof inviteId !== "string") {
      return res.status(400).json({ success: false, error: "Invite ID is required" })
    }

    const result = await projectService.respondToInvite(
      inviteId,
      userId,
      parsed.data.action
    )

    if (result === "NOT_FOUND") {
      return res.status(404).json({ success: false, error: "Invite not found" })
    }
    if (result === "FORBIDDEN") {
      return res.status(403).json({ success: false, error: "This invite is not for you" })
    }
    if (result === "ALREADY_RESPONDED") {
      return res.status(409).json({ success: false, error: "Already responded to this invite" })
    }
    if (result === "EXPIRED") {
      return res.status(410).json({ success: false, error: "This invite has expired" })
    }

    return res.status(200).json({ success: true, data: { result } })
  } catch (error) {
    console.error("[respondToInvite]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getPendingInvites = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const invites = await projectService.getPendingInvites(userId)
    return res.status(200).json({ success: true, data: { invites } })
  } catch (error) {
    console.error("[getPendingInvites]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getMemberRole = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const projectId = req.params.id as string

    if (!projectId) {
      return res.status(400).json({ success: false, error: "Project ID is required" })
    }

    const role = await projectService.getMemberRole(projectId, userId)

    if (!role) {
      return res.status(404).json({ success: false, error: "Not a member" })
    }

    return res.status(200).json({ success: true, data: { role } })
  } catch (error) {
    console.error("[getMemberRole]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
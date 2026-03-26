import type { Request, Response } from "express"
import {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
} from "../validators/task.validator.js"
import * as taskService from "../services/task.service.js"
import { TaskStatus } from "../generated/prisma/enums.js"

export const createTask = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const userName = req.headers["x-user-name"] as string
    const userRole = req.headers["x-user-role"] as string


    console.log("User Id from body:",  req.body.assigneeId)
    console.log("User ID from header:", userId)
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    // only owners can assign tasks
    if (req.body.assigneeId != userId) {
      return res.status(403).json({
        success: false,
        error: "Only the project owner can assign tasks",
      })
    }

    const parsed = createTaskSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    const task = await taskService.createTask(parsed.data, userId, userName)
    return res.status(201).json({ success: true, data: { task } })
  } catch (error) {
    console.error("[createTask]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getProjectTasks = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params

    if(!projectId && typeof projectId !== "string") {
      return res.status(400).json({ success: false, error: "Project ID is required" })
    }
    const status = req.query.status as TaskStatus | undefined

    if(!status || (status !== "TODO" && status !== "IN_PROGRESS" && status !== "DONE"  && status !== "IN_REVIEW")) {
      return res.status(400).json({ success: false, error: "Invalid status filter" })
    }

    if(!projectId || typeof projectId !== "string") {
      return res.status(400).json({ success: false, error: "Project ID is required" })
    }

    const tasks = await taskService.getProjectTasks(projectId, status)
    return res.status(200).json({ success: true, data: { tasks } })
  } catch (error) {
    console.error("[getProjectTasks]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getMyTasks = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const tasks = await taskService.getMyTasks(userId)
    return res.status(200).json({ success: true, data: { tasks } })
  } catch (error) {
    console.error("[getMyTasks]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== "string") {
      return res.status(400).json({ success: false, error: "Task ID is required" })
    }
    const task = await taskService.getTaskById(id)
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found" })
    }
    return res.status(200).json({ success: true, data: { task } })
  } catch (error) {
    console.error("[getTaskById]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const updateTask = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const parsed = updateTaskSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    const TaskIDtobeupdated = req.params.id
    if (!TaskIDtobeupdated || typeof TaskIDtobeupdated !== "string") {
      return res.status(400).json({ success: false, error: "Task ID is required" })
    }
    const task = await taskService.updateTask(TaskIDtobeupdated, parsed.data)
    return res.status(200).json({ success: true, data: { task } })
  } catch (error) {
    console.error("[updateTask]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    const userName = req.headers["x-user-name"] as string

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const parsed = updateStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: parsed.error.format(),
      })
    }

    const taskIDtobeupdated = req.params.id
    if (!taskIDtobeupdated || typeof taskIDtobeupdated !== "string") {
      return res.status(400).json({ success: false, error: "Task ID is required" })
    }
    const task = await taskService.updateTaskStatus(
      taskIDtobeupdated,
      parsed.data.status,
      userId,
      userName
    )
    return res.status(200).json({ success: true, data: { task } })
  } catch (error) {
    console.error("[updateTaskStatus]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }
    const taskIdtobedeleted = req.params.id
    if (!taskIdtobedeleted || typeof taskIdtobedeleted !== "string") {
        return res.status(400).json({ success: false, error: "Task ID is required" })
    }
    await taskService.deleteTask(taskIdtobedeleted)
    return res.status(200).json({ success: true, message: "Task deleted" })
  } catch (error) {
    console.error("[deleteTask]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getProjectProgress = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params

    if(!projectId || typeof projectId !== "string") {
        return res.status(400).json({ success: false, error: "Project ID is required" })
        }
    const progress = await taskService.getProjectProgress(projectId)
    return res.status(200).json({ success: true, data: { progress } })
  } catch (error) {
    console.error("[getProjectProgress]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
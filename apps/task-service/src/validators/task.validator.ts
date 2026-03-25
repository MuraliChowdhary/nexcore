import { z } from "zod"

export const createTaskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  projectId: z.string().uuid("Invalid project ID"),
  assigneeId: z.string().uuid().optional(),
  assigneeName: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assigneeId: z.string().uuid().optional(),
  assigneeName: z.string().optional(),
  dueDate: z.string().datetime().optional(),
})

export const updateStatusSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
})

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>
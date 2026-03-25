import { z } from "zod"

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.array(z.string()).min(1, "Add at least one technology"),
  rolesNeeded: z.array(z.string()).optional().default([]),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
})

export const updateProjectSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  techStack: z.array(z.string()).optional(),
  rolesNeeded: z.array(z.string()).optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
})

export const inviteUserSchema = z.object({
  inviteeId: z.string().uuid("Invalid user ID"),
  inviteeName: z.string().min(1),
})

export const respondInviteSchema = z.object({
  action: z.enum(["ACCEPT", "DECLINE"]),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type InviteUserInput = z.infer<typeof inviteUserSchema>
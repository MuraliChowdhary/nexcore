import { z } from "zod"

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  techStack: z.array(z.string()).min(1, "Add at least one technology"),
  rolesNeeded: z.array(z.string()).optional().default([]),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
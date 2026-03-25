import { TaskStatus } from "../generated/prisma/enums.js"
import { prisma } from "../lib/prisma.js"
import { redis } from "../lib/redis.js"
import type { CreateTaskInput, UpdateTaskInput } from "../validators/task.validator.js"

export const createTask = async (
  input: CreateTaskInput,
  creatorId: string,
  creatorName: string
) => {
  // verify creator is owner of the project
  // we ask project-service via Redis or trust gateway header
  // for now we store creatorId and enforce in controller
  // owner check happens at controller level via x-user-role header

   
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      projectId: input.projectId ,
      assigneeId: input.assigneeId,
      assigneeName: input.assigneeName,
      creatorId,
      creatorName,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
  })

  if (task.assigneeId) {
    await redis.publish(
      "task:assigned",
      JSON.stringify({
        taskId: task.id,
        taskTitle: task.title,
        projectId: task.projectId,
        assigneeId: task.assigneeId,
        assigneeName: task.assigneeName,
        assignedBy: creatorName,
        dueDate: task.dueDate,
      })
    )
  }

  return task
}

export const getProjectTasks = async (
  projectId: string,
  status?: TaskStatus
) => {
  return prisma.task.findMany({
    where: {
      projectId,
      ...(status ? { status } : {}),
    },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
        take: 3, // preview only on list
      },
    },
    orderBy: [
      { status: "asc" },
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  })
}

export const getMyTasks = async (assigneeId: string) => {
  return prisma.task.findMany({
    where: { assigneeId },
    orderBy: [
      { dueDate: "asc" },
      { priority: "desc" },
    ],
    take: 50,
  })
}

export const getTaskById = async (id: string) => {
  return prisma.task.findUnique({
    where: { id },
    include: {
      comments: {
        orderBy: { createdAt: "asc" },
      },
    },
  })
}

export const updateTask = async (
  id: string,
  input: UpdateTaskInput
) => {
  return prisma.task.update({
    where: { id },
    data: {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    },
  })
}

export const updateTaskStatus = async (
  id: string,
  status: TaskStatus,
  userId: string,
  userName: string
) => {
  const task = await prisma.task.update({
    where: { id },
    data: {
      status,
      completedAt: status === "DONE" ? new Date() : null,
    },
  })

  // notify project about status change
  await redis.publish(
    "task:status_changed",
    JSON.stringify({
      taskId: task.id,
      taskTitle: task.title,
      projectId: task.projectId,
      newStatus: status,
      updatedBy: userName,
      updatedById: userId,
      assigneeId: task.assigneeId,
    })
  )

  return task
}

export const deleteTask = async (id: string) => {
  return prisma.task.delete({ where: { id } })
}

export const getProjectProgress = async (projectId: string) => {
  const tasks = await prisma.task.groupBy({
    by: ["status"],
    where: { projectId },
    _count: { status: true },
  })

  const total = tasks.reduce((sum, t) => sum + t._count.status, 0)
  const done = tasks.find((t) => t.status === "DONE")?._count.status ?? 0

  return {
    total,
    done,
    inProgress: tasks.find((t) => t.status === "IN_PROGRESS")?._count.status ?? 0,
    inReview: tasks.find((t) => t.status === "IN_REVIEW")?._count.status ?? 0,
    todo: tasks.find((t) => t.status === "TODO")?._count.status ?? 0,
    percentage: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}
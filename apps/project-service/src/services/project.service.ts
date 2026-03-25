import { prisma } from "../lib/index"
import { redis } from "../lib/redis"
import type { CreateProjectInput, UpdateProjectInput, InviteUserInput } from "../validators/project.validator"

export const getAllProjects = async () => {
  // only return PUBLIC projects in discovery feed
  return prisma.project.findMany({
    where: { visibility: "PUBLIC" },
    include: { members: true },
    orderBy: { createdAt: "desc" },
  })
}

export const getProjectById = async (
  id: string,
  requesterId: string
) => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true },
  })

  if (!project) return null

  // private project — only members can view
  if (project.visibility === "PRIVATE") {
    const isMember = project.members.some(
      (m) => m.userId === requesterId
    )
    if (!isMember) return "FORBIDDEN"
  }

  return project
}

export const createProject = async (
  input: CreateProjectInput,
  userId: string,
  userName: string
) => {
  const project = await prisma.project.create({
    data: {
      title: input.title,
      description: input.description,
      techStack: input.techStack,
      rolesNeeded: input.rolesNeeded,
      visibility: input.visibility,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
    include: { members: true },
  })

  await redis.publish(
    "project:created",
    JSON.stringify({
      projectId: project.id,
      ownerId: userId,
      ownerName: userName,
      title: project.title,
      visibility: project.visibility,
    })
  )

  return project
}

export const updateProject = async (
  id: string,
  input: UpdateProjectInput,
  requesterId: string
) => {
  // only owner can update
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return "NOT_FOUND"
  if (project.ownerId !== requesterId) return "FORBIDDEN"

  return prisma.project.update({
    where: { id },
    data: input,
    include: { members: true },
  })
}

export const joinProject = async (
  projectId: string,
  userId: string,
  userName: string
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  })

  if (!project) return "NOT_FOUND"

  // private projects cannot be joined directly
  if (project.visibility === "PRIVATE") return "PRIVATE"

  const existing = await prisma.member.findUnique({
    where: { userId_projectId: { userId, projectId } },
  })
  if (existing) return "ALREADY_MEMBER"

  const member = await prisma.member.create({
    data: { userId, projectId, role: "COLLABORATOR" },
  })

  // publish — notification-service and chat-service both listen
  await redis.publish(
    "project:joined",
    JSON.stringify({
      projectId,
      userId,
      userName,
      ownerId: project.ownerId,
      projectTitle: project.title,
    })
  )

  return member
}

export const getMyProjects = async (userId: string) => {
  return prisma.project.findMany({
    where: {
      members: { some: { userId } },
    },
    include: { members: true },
    orderBy: { createdAt: "desc" },
  })
}

// ─── Invite System ────────────────────────────────────────

export const inviteUser = async (
  projectId: string,
  input: InviteUserInput,
  inviterId: string,
  inviterName: string
) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) return "NOT_FOUND"

  // only owner can invite
  if (project.ownerId !== inviterId) return "FORBIDDEN"

  // check already a member
  const existing = await prisma.member.findUnique({
    where: {
      userId_projectId: {
        userId: input.inviteeId,
        projectId,
      },
    },
  })
  if (existing) return "ALREADY_MEMBER"

  // check pending invite already exists
  const pendingInvite = await prisma.invite.findUnique({
    where: {
      projectId_inviteeId: {
        projectId,
        inviteeId: input.inviteeId,
      },
    },
  })
  if (pendingInvite && pendingInvite.status === "PENDING") {
    return "ALREADY_INVITED"
  }

  // expires in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invite = await prisma.invite.create({
    data: {
      projectId,
      inviteeId: input.inviteeId,
      inviterId,
      inviterName,
      expiresAt,
    },
  })

  // publish — notification-service creates PROJECT_INVITE notification
  await redis.publish(
    "project:invite",
    JSON.stringify({
      inviteId: invite.id,
      projectId,
      projectTitle: project.title,
      inviteeId: input.inviteeId,
      inviteeName: input.inviteeName,
      inviterId,
      inviterName,
    })
  )

  return invite
}

export const respondToInvite = async (
  inviteId: string,
  userId: string,
  action: "ACCEPT" | "DECLINE"
) => {
  const invite = await prisma.invite.findUnique({
    where: { id: inviteId },
    include: { project: true },
  })

  if (!invite) return "NOT_FOUND"
  if (invite.inviteeId !== userId) return "FORBIDDEN"
  if (invite.status !== "PENDING") return "ALREADY_RESPONDED"
  if (invite.expiresAt < new Date()) {
    await prisma.invite.update({
      where: { id: inviteId },
      data: { status: "EXPIRED" },
    })
    return "EXPIRED"
  }

  if (action === "DECLINE") {
    return prisma.invite.update({
      where: { id: inviteId },
      data: { status: "DECLINED" },
    })
  }

  // ACCEPT — add as member + mark invite accepted
  const [member] = await prisma.$transaction([
    prisma.member.create({
      data: {
        userId,
        projectId: invite.projectId,
        role: "COLLABORATOR",
      },
    }),
    prisma.invite.update({
      where: { id: inviteId },
      data: { status: "ACCEPTED" },
    }),
  ])

  // publish joined event
  await redis.publish(
    "project:joined",
    JSON.stringify({
      projectId: invite.projectId,
      userId,
      ownerId: invite.project.ownerId,
      projectTitle: invite.project.title,
    })
  )

  return member
}

export const getPendingInvites = async (userId: string) => {
  return prisma.invite.findMany({
    where: {
      inviteeId: userId,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  })
}

export const getMemberRole = async (
  projectId: string,
  userId: string
) => {
  const member = await prisma.member.findUnique({
    where: { userId_projectId: { userId, projectId } },
  })
  return member?.role ?? null
}
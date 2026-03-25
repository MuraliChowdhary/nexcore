import { NotificationType } from "../generated/prisma/enums.js"
import { prisma } from "../lib/prisma.js"

interface CreateNotificationInput {
    userId: string
    type: NotificationType
    title: string
    body: string
    metadata?: Record<string, any>
    groupKey?: string
}

// core create — handles grouping logic
export const createNotification = async (
    input: CreateNotificationInput
) => {
    const { userId, type, title, body, metadata, groupKey } = input

    // if groupKey exists, try to find a recent unread notification
    // of the same type within the last 24 hours and increment count
    if (groupKey) {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const existing = await prisma.notification.findFirst({
            where: {
                userId,
                groupKey,
                read: false,
                createdAt: { gte: since },
            },
            orderBy: { createdAt: "desc" },
        })

        if (existing) {
            const newCount = existing.groupCount + 1

            // update title to reflect grouped count
            const updatedTitle = buildGroupedTitle(type, newCount, metadata)

            return prisma.notification.update({
                where: { id: existing.id },
                data: {
                    groupCount: newCount,
                    title: updatedTitle,
                    updatedAt: new Date(),
                },
            })
        }
    }

    // no existing group — create fresh notification
    return prisma.notification.create({
        data: {
            userId,
            type,
            title,
            body,
            metadata: metadata ?? {},
            groupKey: groupKey ?? null,
            groupCount: 1,
        },
    })
}

// builds title like "47 people joined AI Resume Builder"
const buildGroupedTitle = (
    type: NotificationType,
    count: number,
    metadata?: Record<string, any>
): string => {
    switch (type) {
        case "PROJECT_JOINED":
            return `${count} people joined ${metadata?.projectTitle || "your project"}`
        case "TASK_COMMENTED":
            return `${count} new comments on "${metadata?.taskTitle || "your task"}"`
        case "TASK_STATUS_CHANGED":
            return `${count} task updates in ${metadata?.projectTitle || "your project"}`
        default:
            return `${count} new notifications`
    }
}

// get all notifications for a user — newest first
export const getUserNotifications = async (
    userId: string,
    limit = 20,
    onlyUnread = false
) => {
    return prisma.notification.findMany({
        where: {
            userId,
            ...(onlyUnread ? { read: false } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    })
}

// get unread count for bell badge
export const getUnreadCount = async (userId: string) => {
    return prisma.notification.count({
        where: { userId, read: false },
    })
}

// mark one notification as read
export const markAsRead = async (id: string, userId: string) => {
    return prisma.notification.update({
        where: { id },
        data: { read: true },
    })
}

// mark ALL as read
export const markAllAsRead = async (userId: string) => {
    return prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
    })
}

// delete a notification
export const deleteNotification = async (
    id: string,
    userId: string
) => {
    return prisma.notification.delete({
        where: { id },
    })
}
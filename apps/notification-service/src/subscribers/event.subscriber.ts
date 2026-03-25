import type { Redis } from "ioredis"
import { createNotification } from "../services/notification.service.js"

// all channels we care about
const CHANNELS = [
  "task:assigned",
  "task:status_changed",
  "task:commented",
  "project:joined",
  "project:invite",
]

export const startEventSubscriber = (subscriber: Redis) => {
  // subscribe to all channels at once
  subscriber.subscribe(...CHANNELS, (err, count) => {
    if (err) {
      console.error("notification-service: subscribe error", err)
      return
    }
    console.log(
      `notification-service: subscribed to ${count} channels`
    )
  })

  subscriber.on("message", async (channel, message) => {
    try {
      const data = JSON.parse(message)
      await handleEvent(channel, data)
    } catch (err) {
      console.error(`[event.subscriber] error on ${channel}:`, err)
    }
  })
}

const handleEvent = async (
  channel: string,
  data: Record<string, any>
) => {
  switch (channel) {

    // task-service publishes this when a task is created with assignee
    case "task:assigned": {
      await createNotification({
        userId: data.assigneeId,
        type: "TASK_ASSIGNED",
        title: `New task assigned to you`,
        body: `"${data.taskTitle}" was assigned to you by ${data.assignedBy}${
          data.dueDate
            ? ` — due ${new Date(data.dueDate).toLocaleDateString()}`
            : ""
        }`,
        metadata: {
          taskId: data.taskId,
          projectId: data.projectId,
          taskTitle: data.taskTitle,
          assignedBy: data.assignedBy,
          dueDate: data.dueDate,
        },
        // no groupKey — each assignment is unique
      })
      break
    }

    // task-service publishes this when status changes
    case "task:status_changed": {
      // notify assignee if status changed by someone else
      if (
        data.assigneeId &&
        data.assigneeId !== data.updatedById
      ) {
        await createNotification({
          userId: data.assigneeId,
          type: "TASK_STATUS_CHANGED",
          title: `Task status updated`,
          body: `"${data.taskTitle}" was moved to ${formatStatus(data.newStatus)} by ${data.updatedBy}`,
          metadata: {
            taskId: data.taskId,
            projectId: data.projectId,
            taskTitle: data.taskTitle,
            newStatus: data.newStatus,
            updatedBy: data.updatedBy,
          },
          // group by project so multiple updates collapse
          groupKey: `task_status_${data.projectId}`,
        })
      }
      break
    }

    // chat-service or task-service publishes when comment added
    case "task:commented": {
      // notify task creator if commenter is different
      if (data.creatorId && data.creatorId !== data.authorId) {
        await createNotification({
          userId: data.creatorId,
          type: "TASK_COMMENTED",
          title: `New comment on your task`,
          body: `${data.authorName} commented on "${data.taskTitle}": "${data.preview}"`,
          metadata: {
            taskId: data.taskId,
            projectId: data.projectId,
            taskTitle: data.taskTitle,
            authorName: data.authorName,
          },
          // group comments on same task
          groupKey: `task_comment_${data.taskId}`,
        })
      }
      break
    }

    // project-service publishes this when someone joins
    case "project:joined": {
      // notify the project owner
      await createNotification({
        userId: data.ownerId,
        type: "PROJECT_JOINED",
        title: `${data.userName} joined ${data.projectTitle}`,
        body: `Your project "${data.projectTitle}" has a new collaborator`,
        metadata: {
          projectId: data.projectId,
          projectTitle: data.projectTitle,
          joinedUserId: data.userId,
          joinedUserName: data.userName,
        },
        // group joins per project — "47 people joined today"
        groupKey: `project_joined_${data.projectId}`,
      })
      break
    }

    // future: project-service publishes when invite sent
    case "project:invite": {
      await createNotification({
        userId: data.inviteeId,
        type: "PROJECT_INVITE",
        title: `You've been invited to join a project`,
        body: `${data.inviterName} invited you to "${data.projectTitle}"`,
        metadata: {
          projectId: data.projectId,
          projectTitle: data.projectTitle,
          inviterName: data.inviterName,
          inviterId: data.inviterId,
        },
        // invites are always individual — no grouping
      })
      break
    }

    default:
      console.warn(`[event.subscriber] unhandled channel: ${channel}`)
  }
}

const formatStatus = (status: string): string => {
  const map: Record<string, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
  }
  return map[status] ?? status
}
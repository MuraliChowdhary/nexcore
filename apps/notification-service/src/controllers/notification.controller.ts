import type { Request, Response } from "express"
import * as notificationService from "../services/notification.service.js"

export const getNotifications = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.headers["x-user-id"] as string
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const limit = Number(req.query.limit) || 20
    const onlyUnread = req.query.unread === "true"

    const notifications = await notificationService.getUserNotifications(
      userId,
      limit,
      onlyUnread
    )

    return res.status(200).json({
      success: true,
      data: { notifications },
    })
  } catch (error) {
    console.error("[getNotifications]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const getUnreadCount = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.headers["x-user-id"] as string
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const count = await notificationService.getUnreadCount(userId)

    return res.status(200).json({
      success: true,
      data: { count },
    })
  } catch (error) {
    console.error("[getUnreadCount]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const notificationIds = req.params.id
    if (!notificationIds || typeof notificationIds !== "string") {
      return res.status(400).json({ success: false, error: "Notification ID is required" })
    }

    const notification = await notificationService.markAsRead(
      notificationIds,
      userId
    )

    return res.status(200).json({
      success: true,
      data: { notification },
    })
  } catch (error) {
    console.error("[markAsRead]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const markAllAsRead = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.headers["x-user-id"] as string
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    await notificationService.markAllAsRead(userId)

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    console.error("[markAllAsRead]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

export const deleteNotification = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.headers["x-user-id"] as string
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" })
    }

    const notificationId = req.params.id
    if (!notificationId || typeof notificationId !== "string") {
      return res.status(400).json({ success: false, error: "Invalid notification ID" })
    }

    await notificationService.deleteNotification(notificationId, userId)

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    })
  } catch (error) {
    console.error("[deleteNotification]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
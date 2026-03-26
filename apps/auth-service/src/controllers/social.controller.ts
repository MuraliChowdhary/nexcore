import { Request, Response } from "express"
import { prisma } from "../lib/index"
import jwt from "jsonwebtoken"
import { JWTPayload } from "../lib/jwt"
// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getUserId = (req: Request): string | null => {
  // Gateway sets this in production
  const fromGateway = req.headers["x-user-id"] as string
  if (fromGateway) return fromGateway

  // Fallback: decode JWT directly (for local dev without gateway)
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) return null

  try {
    const token = authHeader.split(" ")[1]

    if(!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return decoded.userId
  } catch {
    return null
  }
}

// ─── GET /users — all public users enriched with relationship status ──────────

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)

    const users = await prisma.user.findMany({
      where: { visibility: "PUBLIC" },
      select: {
        id: true,
        name: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        createdAt: true,
        followers: currentUserId
          ? { where: { followerId: currentUserId }, select: { id: true } }
          : false,
        receivedConnections: currentUserId
          ? {
              where: { senderId: currentUserId },
              select: { id: true, status: true },
            }
          : false,
        sentConnections: currentUserId
          ? {
              where: { receiverId: currentUserId },
              select: { id: true, status: true },
            }
          : false,
        _count: { select: { followers: true, following: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    // Flatten relationship state into each user object
    const enriched = users
      .filter((u) => u.id !== currentUserId)
      .map((u) => {
        const isFollowing =
          Array.isArray(u.followers) && u.followers.length > 0

        // Connection they sent to this user
        const sentConn = Array.isArray(u.receivedConnections)
          ? u.receivedConnections[0]
          : null
        // Connection this user sent to them
        const receivedConn = Array.isArray(u.sentConnections)
          ? u.sentConnections[0]
          : null

        let connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" =
          "NONE"
        let connectionId: string | null = null

        if (sentConn?.status === "ACCEPTED" || receivedConn?.status === "ACCEPTED") {
          connectionStatus = "ACCEPTED"
          connectionId = sentConn?.id || receivedConn?.id || null
        } else if (sentConn?.status === "PENDING") {
          connectionStatus = "PENDING_SENT"
          connectionId = sentConn.id
        } else if (receivedConn?.status === "PENDING") {
          connectionStatus = "PENDING_RECEIVED"
          connectionId = receivedConn.id
        }

        const { followers, receivedConnections, sentConnections, ...rest } = u
        return {
          ...rest,
          isFollowing,
          connectionStatus,
          connectionId,
        }
      })

    return res.status(200).json({ success: true, data: { users: enriched } })
  } catch (error) {
    console.error("[getAllUsers]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── GET /users/:id — single user profile ────────────────────────────────────

export const getUserById = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        visibility: true,
        createdAt: true,
        _count: { select: { followers: true, following: true } },
      },
    })

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." })
    }
    if (user.visibility === "PRIVATE" && user.id !== currentUserId) {
      return res.status(403).json({ success: false, message: "This profile is private." })
    }

    return res.status(200).json({ success: true, data: { user } })
  } catch (error) {
    console.error("[getUserById]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── POST /users/:id/follow ───────────────────────────────────────────────────

export const followUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const { id: targetId } = req.params
    if (targetId === currentUserId) {
      return res.status(400).json({ success: false, message: "Cannot follow yourself." })
    }

    const target = await prisma.user.findUnique({ where: { id: targetId } })
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found." })
    }

    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: currentUserId, followingId: targetId } },
      create: { followerId: currentUserId, followingId: targetId },
      update: {},
    })

    return res.status(200).json({ success: true, message: `Now following ${target.name}.` })
  } catch (error) {
    console.error("[followUser]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── DELETE /users/:id/follow ─────────────────────────────────────────────────

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const { id: targetId } = req.params

    await prisma.follow.deleteMany({
      where: { followerId: currentUserId, followingId: targetId },
    })

    return res.status(200).json({ success: true, message: "Unfollowed." })
  } catch (error) {
    console.error("[unfollowUser]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── GET /users/me/followers ──────────────────────────────────────────────────

export const getMyFollowers = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const follows = await prisma.follow.findMany({
      where: { followingId: currentUserId },
      include: {
        follower: {
          select: { id: true, name: true, bio: true, skills: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return res.status(200).json({
      success: true,
      data: { followers: follows.map((f) => f.follower) },
    })
  } catch (error) {
    console.error("[getMyFollowers]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── GET /users/me/following ──────────────────────────────────────────────────

export const getMyFollowing = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const follows = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      include: {
        following: {
          select: { id: true, name: true, bio: true, skills: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return res.status(200).json({
      success: true,
      data: { following: follows.map((f) => f.following) },
    })
  } catch (error) {
    console.error("[getMyFollowing]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── POST /users/:id/connect — send connection invite ────────────────────────

export const sendConnectionInvite = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const { id: receiverId } = req.params
    const { message } = req.body

    if (receiverId === currentUserId) {
      return res.status(400).json({ success: false, message: "Cannot connect with yourself." })
    }

    const target = await prisma.user.findUnique({ where: { id: receiverId } })
    if (!target) {
      return res.status(404).json({ success: false, message: "User not found." })
    }

    // Check if reverse connection exists (they already sent one)
    const reverse = await prisma.connection.findUnique({
      where: { senderId_receiverId: { senderId: receiverId, receiverId: currentUserId } },
    })
    if (reverse?.status === "ACCEPTED") {
      return res.status(400).json({ success: false, message: "Already connected." })
    }
    if (reverse?.status === "PENDING") {
      // Auto-accept if they already invited us
      const updated = await prisma.connection.update({
        where: { id: reverse.id },
        data: { status: "ACCEPTED" },
      })
      return res.status(200).json({
        success: true,
        message: `Connected with ${target.name}.`,
        data: { connection: updated },
      })
    }

    const connection = await prisma.connection.upsert({
      where: { senderId_receiverId: { senderId: currentUserId, receiverId } },
      create: { senderId: currentUserId, receiverId, message: message?.trim() || null },
      update: { status: "PENDING", message: message?.trim() || null },
    })

    return res.status(201).json({
      success: true,
      message: `Connection request sent to ${target.name}.`,
      data: { connection },
    })
  } catch (error) {
    console.error("[sendConnectionInvite]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── PATCH /users/connections/:connectionId/respond ──────────────────────────

export const respondToConnection = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const { connectionId } = req.params
    const { action } = req.body // "ACCEPT" | "DECLINE"

    if (!["ACCEPT", "DECLINE"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be ACCEPT or DECLINE." })
    }

    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    })

    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection request not found." })
    }
    if (connection.receiverId !== currentUserId) {
      return res.status(403).json({ success: false, message: "Not authorized to respond to this request." })
    }
    if (connection.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Request already responded to." })
    }

    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED" },
    })

    return res.status(200).json({
      success: true,
      message: action === "ACCEPT" ? "Connection accepted." : "Connection declined.",
      data: { connection: updated },
    })
  } catch (error) {
    console.error("[respondToConnection]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── GET /users/connections/pending — incoming pending requests ───────────────

export const getPendingConnections = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const requests = await prisma.connection.findMany({
      where: { receiverId: currentUserId, status: "PENDING" },
      include: {
        sender: {
          select: { id: true, name: true, bio: true, skills: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return res.status(200).json({
      success: true,
      data: {
        requests: requests.map((r) => ({
          connectionId: r.id,
          message: r.message,
          createdAt: r.createdAt,
          sender: r.sender,
        })),
      },
    })
  } catch (error) {
    console.error("[getPendingConnections]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ─── GET /users/connections — all accepted connections ────────────────────────

export const getMyConnections = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req)
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }

    const connections = await prisma.connection.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
      },
      include: {
        sender:   { select: { id: true, name: true, bio: true, skills: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, bio: true, skills: true, avatarUrl: true } },
      },
      orderBy: { updatedAt: "desc" },
    })

    const peers = connections.map((c) =>
      c.senderId === currentUserId ? c.receiver : c.sender
    )

    return res.status(200).json({ success: true, data: { connections: peers } })
  } catch (error) {
    console.error("[getMyConnections]", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}
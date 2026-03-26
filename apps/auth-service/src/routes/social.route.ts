import { Router } from "express"
import {
  getAllUsers,
  getUserById,
  followUser,
  unfollowUser,
  getMyFollowers,
  getMyFollowing,
  sendConnectionInvite,
  respondToConnection,
  getPendingConnections,
  getMyConnections,
} from "../controllers/social.controller" 
 
const router:Router = Router()
 
// ── People discovery ──────────────────────────────────────────────────────────
router.get("/",             getAllUsers)
router.get("/me/followers", getMyFollowers)
router.get("/me/following",  getMyFollowing)
 
// ── Connections ───────────────────────────────────────────────────────────────
router.get("/connections", getMyConnections)
router.get("/connections/pending", getPendingConnections)
router.patch("/connections/:connectionId/respond", respondToConnection)
 
// ── Single user (keep last to avoid catching /connections routes) ─────────────
router.get("/:id",            getUserById)
router.post("/:id/follow",    followUser)
router.delete("/:id/follow", unfollowUser)
router.post("/:id/connect",  sendConnectionInvite)
 
export default router
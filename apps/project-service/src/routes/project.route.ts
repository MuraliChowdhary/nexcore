import { Router } from "express"
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  joinProject,
  getMyProjects,
  inviteUser,
  respondToInvite,
  getPendingInvites,
  getMemberRole,
} from "../controllers/project.controller"

const router:Router = Router()

// project routes
router.get("/", getAllProjects)
router.get("/user/mine", getMyProjects)
router.get("/invites/pending", getPendingInvites)
router.get("/:id", getProjectById)
router.get("/:id/role", getMemberRole)
router.post("/", createProject)
router.put("/:id", updateProject)
router.post("/:id/join", joinProject)

// invite routes
router.post("/:id/invite", inviteUser)
router.patch("/invites/:inviteId/respond", respondToInvite)

export default router
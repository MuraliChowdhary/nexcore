import { Router } from "express"
import {
  getAllProjects,
  getProjectById,
  createProject,
  joinProject,
  getMyProjects,
} from "../controllers/project.controller"

const router:Router = Router()

router.get("/", getAllProjects)
router.get("/user/mine", getMyProjects)
router.get("/:id", getProjectById)
router.post("/", createProject)
router.post("/:id/join", joinProject)

export default router
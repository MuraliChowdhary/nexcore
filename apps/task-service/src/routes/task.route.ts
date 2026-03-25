import { Router } from "express"
import {
  createTask,
  getProjectTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getProjectProgress,
} from "../controllers/task.controller.js"
import { addComment, getComments } from "../controllers/comment.controller.js"

const router:Router = Router()

// task routes
router.post("/", createTask)
router.get("/my", getMyTasks)
router.get("/project/:projectId", getProjectTasks)
router.get("/project/:projectId/progress", getProjectProgress)
router.get("/:id", getTaskById)
router.put("/:id", updateTask)
router.patch("/:id/status", updateTaskStatus)
router.delete("/:id", deleteTask)

// comment routes
router.post("/:taskId/comments", addComment)
router.get("/:taskId/comments", getComments)

export default router
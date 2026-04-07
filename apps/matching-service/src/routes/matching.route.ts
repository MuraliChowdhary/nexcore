import { Router } from "express"
import { findMatches, indexUser } from "../controllers/matching.controller"

const router = Router()

router.get("/match", findMatches)
router.post("/index", indexUser)

export default router
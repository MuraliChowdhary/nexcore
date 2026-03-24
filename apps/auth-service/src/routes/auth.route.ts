import { Router } from "express"
import { register, login, getProfile } from "../controllers/auth.controller"

const router: Router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", getProfile)

export default router
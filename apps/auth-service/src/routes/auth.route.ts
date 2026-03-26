import { Router } from "express"
import { register, login, getProfile, changePassword, updateProfile, allusers } from '../controllers/auth.controller';

const router: Router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/profile", getProfile)
router.put("/profile", updateProfile)
router.post("/change-password", changePassword)
router.get("/users", allusers)

export default router
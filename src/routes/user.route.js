import { Router } from "express";
import { registeUser } from "../controllers/user.controller";

const router = Router()

router.route("/register").post(registeUser)

export default router
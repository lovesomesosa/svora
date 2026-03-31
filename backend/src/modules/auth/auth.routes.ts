import { Router } from "express";
import { register, login } from "./auth.controller.js";
import { me } from "./auth.protected.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// защищённый
router.get("/me", authMiddleware, me);

export default router;
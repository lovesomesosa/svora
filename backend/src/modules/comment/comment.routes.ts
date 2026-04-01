import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { getAllComments } from "./comment.controller.js";

const router = Router();

router.get("/all", authMiddleware, roleMiddleware("OWNER"), getAllComments);

export default router;
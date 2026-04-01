import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { getAllVersions } from "./version.controller.js";

const router = Router();

router.get("/all", authMiddleware, roleMiddleware("OWNER"), getAllVersions);

export default router;
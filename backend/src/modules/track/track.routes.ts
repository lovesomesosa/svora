import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { createTrackVersion } from "../version/version.controller.js";

const router = Router();

router.post("/:id/versions", authMiddleware, createTrackVersion);

export default router;
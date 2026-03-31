import { Router } from "express";
import {
  createProject,
  getMyProjects,
  getProjectById,
} from "./project.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { createTrack } from "../track/track.controller.js";

const router = Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getMyProjects);
router.get("/:id", authMiddleware, getProjectById);

router.post("/:id/tracks", authMiddleware, createTrack);

export default router;
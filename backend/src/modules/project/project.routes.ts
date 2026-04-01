import { Router } from "express";
import {
  createProject,
  getMyProjects,
  getProjectById,
  getProjectTracks,
  getAllProjects,
} from "./project.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { createTrack } from "../track/track.controller.js";

const router = Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getMyProjects);
router.get("/all", authMiddleware, roleMiddleware("OWNER"), getAllProjects);

router.get("/:id/tracks", authMiddleware, getProjectTracks);
router.post("/:id/tracks", authMiddleware, createTrack);

router.get("/:id", authMiddleware, getProjectById);
console.log("project routes loaded")

export default router;
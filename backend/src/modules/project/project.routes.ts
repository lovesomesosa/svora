import { Router } from "express";
import {
  createProject,
  getMyProjects,
  getProjectById,
  getAllProjects,
} from "./project.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { createTrack } from "../track/track.controller.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";

const router = Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getMyProjects);
router.get("/all", authMiddleware, roleMiddleware("OWNER"),getAllProjects);
router.get("/all", authMiddleware, roleMiddleware("OWNER"), getAllProjects);

router.post("/:id/tracks", authMiddleware, createTrack);

export default router;

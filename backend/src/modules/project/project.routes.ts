import { Router } from "express";
import {
  createProject,
  getMyProjects,
  getProjectById,
} from "./project.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, createProject);
router.get("/", authMiddleware, getMyProjects);
router.get("/:id", authMiddleware, getProjectById);

export default router;
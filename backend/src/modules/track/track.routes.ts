import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { roleMiddleware } from "../../middlewares/role.middleware.js";
import { getAllTracks, getTrackById, getTracksByProject } from "./track.controller.js";
import { createComment, getComments } from "../comment/comment.controller.js";
import {
  createTrackVersion,
  getTrackVersions,
} from "../version/version.controller.js";

const router = Router();

router.get("/:id", authMiddleware, getTrackById); // Получить трек по ID
router.get("/project/:projectId", authMiddleware, getTracksByProject); // Получить треки проекта

router.get("/all", authMiddleware, roleMiddleware("OWNER"), getAllTracks);

router.post("/:id/comments", authMiddleware, createComment);
router.get("/:id/comments", authMiddleware, getComments);

router.post("/:id/versions", authMiddleware, createTrackVersion);
router.get("/:id/versions", authMiddleware, getTrackVersions);

export default router;
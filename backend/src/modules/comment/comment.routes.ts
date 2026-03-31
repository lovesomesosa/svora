import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  createComment,
  getComments,
} from "./comment.controller.js";

const router = Router();

router.post("/:id/comments", authMiddleware, createComment);
router.get("/:id/comments", authMiddleware, getComments);

export default router;
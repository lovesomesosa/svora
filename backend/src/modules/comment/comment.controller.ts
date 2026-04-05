import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { failure, success } from "../../utils/api-response.js";
import { createCommentSchema } from "./comment.schema.js";
import * as commentService from "./comment.service.js";

import { asyncHandler } from "../../utils/async-handler.js"; // упрощаем try/catch блоки с помощью asyncHandler

type TrackIdParams = {
  id: string;
};

export const createComment = asyncHandler(
  async (req: AuthRequest<TrackIdParams>, res: Response) => {
    const parsed = createCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      return failure(res, "Validation failed", 400, parsed.error.flatten());
    }

    const comment = await commentService.createComment(
      req.params.id,
      req.user!.userId,
      parsed.data,
    );

    return success(res, comment, "Comment created", 201);
  },
);

export const getComments = asyncHandler(
  async (req: AuthRequest<TrackIdParams>, res: Response) => {
    const { page, limit } = req.query;

    const comments = await commentService.getCommentsByTrack(
      req.params.id,
      req.user!.userId,
      req.user!.role,  // передаем роль пользователя
      typeof page === "string" ? page : undefined,
      typeof limit === "string" ? limit : undefined,
    );

    return success(res, comments, "Comments fetched");
  },
);

export const getAllComments = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page, limit } = req.query;

    const comments = await commentService.getAllComments(
      typeof page === "string" ? page : undefined,
      typeof limit === "string" ? limit : undefined,
    );

    return success(res, comments, "All comments fetched");
  },
);
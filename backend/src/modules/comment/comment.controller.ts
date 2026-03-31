import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { failure, success } from "../../utils/api-response.js";
import { createCommentSchema } from "./comment.schema.js";
import * as commentService from "./comment.service.js";

type TrackIdParams = {
  id: string;
};

export const createComment = async (
  req: AuthRequest<TrackIdParams>,
  res: Response,
) => {
  try {
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
  } catch (error) {
    return failure(
      res,
      error instanceof Error ? error.message : "Failed to create comment",
      400,
    );
  }
};

export const getComments = async (
  req: AuthRequest<TrackIdParams>,
  res: Response,
) => {
  try {
    const comments = await commentService.getCommentsByTrack(
      req.params.id,
      req.user!.userId,
    );

    return success(res, comments, "Comments fetched");
  } catch (error) {
    return failure(
      res,
      error instanceof Error ? error.message : "Failed to fetch comments",
      400,
    );
  }
};
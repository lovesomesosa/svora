import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { failure, success } from "../../utils/api-response.js";
import { createTrackSchema } from "./track.schema.js";
import * as trackService from "./track.service.js";

import { asyncHandler } from "../../utils/async-handler.js"; // упрощаем try/catch блоки с помощью asyncHandler

type ProjectIdParams = {
  id: string;
};

export const createTrack = asyncHandler (
  async (
  req: AuthRequest<ProjectIdParams>,
  res: Response,
) => {
    const parsed = createTrackSchema.safeParse(req.body);

    if (!parsed.success) {
      return failure(res, "Validation failed", 400, parsed.error.flatten());
    }

    const track = await trackService.createTrack(
      req.params.id,
      req.user!.userId,
      parsed.data,
    );

    return success(res, track, "Track created", 201);
  }
);
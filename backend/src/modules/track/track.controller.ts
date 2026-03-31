import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { failure, success } from "../../utils/api-response.js";
import { createTrackSchema } from "./track.schema.js";
import * as trackService from "./track.service.js";

type ProjectIdParams = {
  id: string;
};

export const createTrack = async (
  req: AuthRequest<ProjectIdParams>,
  res: Response,
) => {
  try {
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
  } catch (error) {
    return failure(
      res,
      error instanceof Error ? error.message : "Failed to create track",
      400,
    );
  }
};
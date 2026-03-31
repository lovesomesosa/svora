import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { failure, success } from "../../utils/api-response.js";
import { createTrackVersionSchema } from "./version.schema.js";
import * as versionService from "./version.service.js";

type TrackIdParams = {
  id: string;
};

export const createTrackVersion = async (
  req: AuthRequest<TrackIdParams>,
  res: Response,
) => {
  try {
    const parsed = createTrackVersionSchema.safeParse(req.body);

    if (!parsed.success) {
      return failure(res, "Validation failed", 400, parsed.error.flatten());
    }

    const version = await versionService.createTrackVersion(
      req.params.id,
      req.user!.userId,
      parsed.data,
    );

    return success(res, version, "Track version created", 201);
  } catch (error) {
    return failure(
      res,
      error instanceof Error ? error.message : "Failed to create track version",
      400,
    );
  }
};
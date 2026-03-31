import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { failure, success } from "../../utils/api-response.js";
import { createTrackVersionSchema } from "./version.schema.js";
import * as versionService from "./version.service.js";

import { asyncHandler } from "../../utils/async-handler.js"; // упрощаем try/catch блоки с помощью asyncHandler

type TrackIdParams = {
  id: string;
};

export const createTrackVersion = asyncHandler(
  async (req: AuthRequest<TrackIdParams>, res: Response) => {
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
  },
);

import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";
import { failure, success } from "../../utils/api-response.js";
import { createTrackSchema } from "./track.schema.js";
import * as trackService from "./track.service.js";

import { asyncHandler } from "../../utils/async-handler.js"; // упрощаем try/catch блоки с помощью asyncHandler

type ProjectIdParams = {
  id: string;
};

export const createTrack = asyncHandler(
  async (req: AuthRequest<ProjectIdParams>, res: Response) => {
    const parsed = createTrackSchema.safeParse(req.body);

    if (!parsed.success) {
      return failure(res, "Validation failed", 400, parsed.error.flatten());
    }

    const track = await trackService.createTrack(
      req.params.id,
      req.user!.userId,
      req.user!.role,  // передаем роль пользователя
      parsed.data,
    );

    return success(res, track, "Track created", 201);
  },
);

export const getAllTracks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page, limit } = req.query;

    const tracks = await trackService.getAllTracks(
      typeof page === "string" ? page : undefined,
      typeof limit === "string" ? limit : undefined,
    );

    return success(res, tracks, "All tracks fetched");
  },
);

type TrackIdParams = {
  id: string;
};

export const getTrackById = asyncHandler<AuthRequest<TrackIdParams>>(
  async (req: AuthRequest<TrackIdParams>, res: Response) => {
    const track = await trackService.getTrackById(
      req.params.id,
      req.user!.userId
    );
    return success(res, track, "Track fetched");
  }
);

export const getTracksByProject = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const { projectId } = req.params;
    const tracks = await trackService.getTracksByProject(
      projectId,
      req.user!.userId
    );
    return success(res, tracks, "Tracks fetched");
  }
);
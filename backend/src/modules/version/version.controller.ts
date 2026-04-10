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
      req.user!.role,  // передаем роль пользователя
      parsed.data,
    );

    return success(res, version, "Track version created", 201);
  },
);

export const getAllVersions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page, limit } = req.query;

    const versions = await versionService.getAllVersions(
      typeof page === "string" ? page : undefined,
      typeof limit === "string" ? limit : undefined,
    );

    return success(res, versions, "All versions fetched");
  },
);

export const getTrackVersions = asyncHandler(
  async (req: AuthRequest<TrackIdParams>, res: Response) => {
    const versions = await versionService.getTrackVersions(
      req.params.id,
      req.user!.userId,
      req.user!.role,  // передаем роль пользователя
    );

    return success(res, versions, "Track versions fetched");
  },
);

// контроллер для загрузки новой версии трека с проверкой прав доступа и уникальности имени версии, а также сохранением файла и генерацией URL для доступа к нему
export const uploadTrackVersion = asyncHandler(
  async (req: AuthRequest<TrackIdParams>, res: Response) => {
    const versionName = req.body.versionName;
    const file = req.file;

    if (!versionName || typeof versionName !== "string") {
      return failure(res, "versionName is required", 400);
    }

    if (!file) {
      return failure(res, "Audio file is required", 400);
    }

    const fileUrl = `/uploads/track-versions/${file.filename}`;

    const version = await versionService.uploadTrackVersion(
      req.params.id,
      req.user!.userId,
      req.user!.role,
      versionName,
      fileUrl,
    );

    return success(res, version, "Track version uploaded", 201);
  },
);
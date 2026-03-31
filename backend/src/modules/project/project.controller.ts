import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.middleware.js";

import * as projectService from "./project.service.js";
import {
  createProjectSchema,
  projectIdParamsSchema,
} from "./project.schema.js";

import { failure, success } from "../../utils/api-response.js";
import { asyncHandler } from "../../utils/async-handler.js"; // упрощаем try/catch блоки с помощью asyncHandler

type ProjectIdParams = {
  id: string;
};

export const createProject = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
  
    const parsed = createProjectSchema.safeParse(req.body);

    if (!parsed.success) {
      return failure(res, "Validation failed", 400, parsed.error.flatten());
    }

    const project = await projectService.createProject(
      req.user!.userId,
      parsed.data,
    );

    return success(res, project, "Project created", 201);
});

export const getMyProjects = asyncHandler<AuthRequest>(
  async (req: AuthRequest, res: Response) => {
    const projects = await projectService.getMyProjects(req.user!.userId);
    return success(res, projects, "Projects fetched");
  } 
);

export const getProjectById = asyncHandler<AuthRequest<ProjectIdParams>>(
  async (req: AuthRequest<ProjectIdParams>, res: Response) => {
    const parsedParams = projectIdParamsSchema.safeParse(req.params);

    if (!parsedParams.success) {
      return failure(
        res,
        "Validation failed",
        400,
        parsedParams.error.flatten(),
      );
    }

    const project = await projectService.getProjectById(
      parsedParams.data.id,
      req.user!.userId,
    );

    return success(res, project, "Project fetched");
  }
);